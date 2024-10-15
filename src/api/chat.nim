import std/[times, os, json, strutils]
import norm/[postgres, types]
import ws, ws/jester_extra
import "../websockets.nim"
import "../models.nim"
import jester



type mixedTableContainer* = ref object
  username*: StringOfCap[16] = newStringOfCap[16]("")
  message*: StringOfCap[300] = newStringOfCap[300]("")
  timestamp*: int = 0

router chat:
  post "/postmessage":

    let messageText = request.formData["message"].body
    let userToken = request.cookies["token"]
    var curTime = epochTime() 
    var socketMsg = ""

    var userContainer = newUser()
    var message = newMessage()
    

    var unixTime = int(curTime * 1000) # get Unix epoch time in miliseconds
    
    if (messageText.len > 300):
      resp Http400

    withDb:
      
      db.select(userContainer, "User.token = $1", userToken)
  
      message.message = newStringOfCap[300](messageText)
      message.time = unixTime
      message.userfk = userContainer 
      
      db.insert(message)

    socketMsg = ("<b>" & $userContainer.username & "<b> : " &  $message.message)

    for socket in socketsChat:
      discard socket.send(socketMsg) 

    resp Http200

  get "/messagestream":
    let ws = await newWebSocket(request)
    add(socketsChat, ws)
    resp Http200

  get "/getmessages":
    var outputArr: array[25, array[2, string]]
    var i = 0
    var joinQuerry = "SELECT username, message, timestamp FROM messages INNER JOIN users ON messages.userid = users.id ORDER BY timestamp desc LIMIT 25"
    
    var messages = @[mixedTableContainer()]

    withDb:
      # db.select(messages, "User.name NOT NULL ORDER BY timestamp desc LIMIT  25")
      db.rawSelect(joinQuerry, messages)
      for message in messages:
        outputArr[i][0] = $ message.username
        outputArr[i][1] = $ message.message
        i+=1
    resp Http200, $(%* outputArr)