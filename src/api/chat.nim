import std/[times, os, json, strutils]
import norm/[postgres, types]
import ws, ws/jester_extra
import "../websockets.nim"
import "../models.nim"
import jester



type mixedTableContainer* = ref object      # for containing the select querry result with both usernames and messages
  username*: StringOfCap[16] = newStringOfCap[16]("")
  message*: StringOfCap[300] = newStringOfCap[300]("")
  time*: int = 0

router chat:
  post "/postmessage":      # takes in the message as formData, requires a token cookie to work
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
      
      db.select(userContainer, "loginToken = $1", userToken)
  
      message.message = newStringOfCap[300](messageText)
      message.time = unixTime
      message.userfk = userContainer 
      
      db.insert(message)

    socketMsg = ( $(($userContainer.username).len) & ";" & $userContainer.username &  $message.message)   #first two or three characters are reserved for the length of the username, seperated by a semicolon

    for socket in socketsChat:
      discard socket.send(socketMsg)      # inform everyone of the new message

    resp Http201      # 201 for succesfully created

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

  post "/getuserhistory":
    try:
      var token = request.cookies["token"]
      var username = request.formData["username"].body
      var messageHistory = @[mixedTableContainer()]
      var sqlQuerry = "SELECT username, message, time FROM \"Messages\" INNER JOIN \"Users\"  ON \"Messages\".userfk = \"Users\".id WHERE username = $1 ORDER BY time asc"
      var messages: seq[string]

      withDb:
        if(not db.exists(User, "loginToken = $1", token)):
          resp Http400, "Token not in database"
        db.rawSelect(sqlQuerry, messageHistory, username)
      for message in messageHistory:
        messages.add($message.time & $message.message)
      resp Http200, $(%* messages)
    except:
      echo getCurrentExceptionMsg() 
      resp Http500 

  post "/deletemessage":
    var token = request.cookies["token"]
    var username = request.formData["username"].body
    var time = request.formData["time"].body
    
    var requestUser = newUser()
    var offendingMessage = newMessage()

    withDb:
      if(not db.exists(User, "loginToken = $1", token)):
        resp Http400, "Token invalid"
      db.select(requestUser, "username = $1", username)
      if(not requestUser.admin):
        resp Http400, "You're not admin"
      db.select(offendingMessage, "time = $1", time)
      db.delete(offendingMessage)
    resp Http200