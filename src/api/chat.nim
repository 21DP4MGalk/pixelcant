import jester
import norm/[postgres]
import "../models.nim"
import times
import std/json

router chat:
  post "/postmessage":
    let curTime = getTime();  
    let curTime = curTime.toUnixFloat() * 1000 // get Unix epoch time in miliseconds
    let messageText = request.formData["message"].body
    let userToken = request.formData["token"].body
    let timestamp = request.formData["time"].body
    
    if messageText.len > 300 || curTime < timestamp:
      resp Http400

    var userContainer = newUser()
    dbConn.select(userContainer, "User.token = ?", userToken)
    var message = newMessage(messageText, timestamp, userContainer)
    message.message = newStringOfCap[300](messageText)
    message.timestamp = timestamp
    message.userfk = userContainer 
    dbConn.insert(message)

    resp Http200

  post "/getmessages":
    var messages = @[newMessage()]
    dbConn.select(messages, "true ORDER BY timestamp desc LIMIT  25")
    jsonMsg = %* messages
    resp jsonMsg
