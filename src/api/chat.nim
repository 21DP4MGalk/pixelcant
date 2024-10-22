import jester
import std/[times, json, strutils]
import norm/[postgres, types]
import ws, ws/jester_extra
import "../websockets.nim"
import "../models.nim"

type mixedTableContainer* = ref object      # for containing the select querry result with both usernames and messages
  username*: StringOfCap[16] = newStringOfCap[16]("")
  message*: StringOfCap[300] = newStringOfCap[300]("")
  time*: int = 0


router chat:
  post "/postmessage":      # takes in the message as formData, requires a token cookie to work
    try:
      let messageText = request.formData["message"].body
      let userToken = request.cookies["token"]
      var socketMsg = ""
      var curTime = epochTime()
      var unixTime = int(curTime * 1000) # get Unix epoch time in miliseconds

      var userContainer = newUser()
      var message = newMessage()

      if (messageText.len > 300):
        resp Http400, "Messages are limited to 300 characters, please limit your message length, and don't just request the API directly"

      withDb:
        if(not db.exists(User, "loginToken = $1", userToken)):
          resp Http400, "Invalid token, not found in database"
        db.select(userContainer, "loginToken = $1", userToken)
    
        if(userContainer.banned):
          resp Http403, "Invalid request, you're banned"

        message.message = newStringOfCap[300](messageText)
        message.time = unixTime
        message.userfk = userContainer 
        
        db.insert(message)

      socketMsg = ( $(($userContainer.username).len) & ";" & $userContainer.username &  $message.message)   #first two or three characters are reserved for the length of the username, seperated by a semicolon

      for socket in socketsChat:
        discard socket.send(socketMsg)      # inform everyone of the new message

      resp Http201      # 201 for succesfully created
    except:
      resp Http401


  get "/messagestream":     # creates a websocket specifically for messages
    let ws = await newWebSocket(request)
    add(socketsChat, ws)
    resp Http201


  get "/getmessages":     # gets 25 most recent messages from the database, might be worth making it more Norm friendly, currently rawSelect is fine
    var outputArr: array[25, array[2, string]]      # gets filled with empty spots when not enough messages, which is fine 
    var joinQuerry = "SELECT username, message, time FROM \"Messages\" INNER JOIN \"Users\"  ON \"Messages\".userfk = \"Users\".id ORDER BY time desc LIMIT 25;"
    var messages = @[mixedTableContainer()]

    withDb:  
      db.rawSelect(joinQuerry, messages)

    var i = 0
    for message in messages:
      outputArr[i][0] = $ message.username
      outputArr[i][1] = $ message.message
      i+=1

    resp Http200, $(%* outputArr)


  post "/getuserhistory":     # gets the entire user message history for admins to judge
    try:
      var token = request.cookies["token"]
      var username = request.formData["username"].body
      var messageHistory = @[mixedTableContainer()]
      var sqlQuerry = "SELECT username, message, time FROM \"Messages\" INNER JOIN \"Users\"  ON \"Messages\".userfk = \"Users\".id WHERE username = $1 ORDER BY time asc"
      var messages: seq[string]

      withDb:
        if(not db.exists(User, "loginToken = $1 and admin = true", token)):
          resp Http401, "You are not authenticated as an admin"
          
        db.rawSelect(sqlQuerry, messageHistory, username)

      for message in messageHistory:
        messages.add($message.time & $message.message)

      resp Http200, $(%* messages)
    
    except:
      resp Http500 


  post "/deletemessage":      # deletes a message when given a timestamp in unix epoch milliseconds
    var token = request.cookies["token"]
    var username = request.formData["username"].body
    var timestamp = parseInt(request.formData["timestamp"].body)
    echo timestamp

    var requestUser = newUser()
    var offendingMessage = newMessage()

    withDb:
      if(not db.exists(User, "loginToken = $1 and admin = true", token)):
        resp Http401, "Token invalid or not admin"

      if(not db.exists(Message, "time = $1", timestamp)):
        resp Http404, "Message does not exist"

      db.select(offendingMessage, "time = $1", timestamp)
      db.delete(offendingMessage)

    resp Http200
