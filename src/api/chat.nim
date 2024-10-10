import jester
import norm/[postgres, types]
import "../models.nim"
import times
import std/json
import strutils

router chat:
  post "/postmessage":
    var curTime = getTime();  
    var unixTime = int(curTime.toUnixFloat() * 1000) # get Unix epoch time in miliseconds
    let messageText = request.formData["message"].body
    let userToken = request.formData["token"].body
    let timestamp: int = parseInt(request.formData["time"].body)
    
    if (messageText.len > 300 or unixTime < timestamp):
      resp Http400

    withDb:
      
      var userContainer = newUser()
      db.select(userContainer, "User.token = ?", userToken)
      var message = newMessage()
      message.message = newStringOfCap[300](messageText)
      message.time = timestamp
      message.userfk = userContainer 
      db.insert(message)

      resp Http200

#[ UNDER CONSTRUCTION
    post "/getmessages":
    var messages = @[newMessage()]
    withDb:
      db.select(messages, "true ORDER BY timestamp desc LIMIT  25")
]#    
