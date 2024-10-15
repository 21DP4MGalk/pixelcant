import jester
import norm/[postgres, types]
import "../models.nim"
import std/[times, os]
import std/json
import strutils

type mixedTableContainer* = ref object
      username*: StringOfCap[16] = newStringOfCap[16]("")
      message*: StringOfCap[300] = newStringOfCap[300]("")
      timestamp*: int = 0

router chat:
  post "/postmessage":
    var curTime = epochTime();  
    var unixTime = int(curTime * 1000) # get Unix epoch time in miliseconds
    let messageText = request.formData["message"].body
    let userToken = request.formData["token"].body
    let timestamp: int = parseInt(request.formData["time"].body)
    
    if (messageText.len > 300 or unixTime < timestamp):
      resp Http400

    withDb:
      
      var userContainer = newUser()
      db.select(userContainer, "User.token = $1", userToken)
      var message = newMessage()
      message.message = newStringOfCap[300](messageText)
      message.time = timestamp
      message.userfk = userContainer 
      db.insert(message)

      resp Http200
#[         IT'S ALL FUCKED
  post "/getmessages":
    
    
    var outputNames: array[25, StringOfCap[16]]
    var outputMessages: array[25, StringOfCap[300]]
    var i = 0
    var joinQuerry = "SELECT username, message, timestamp FROM messages INNER JOIN users ON messages.userid = users.id ORDER BY timestamp desc LIMIT 25"
    
    var messages = @[mixedTableContainer()]

    withDb:
      # db.select(messages, " User.name NOT NULL ORDER BY timestamp desc LIMIT  25")
      db.rawSelect(joinQuerry, messages)
      for message in messages:
        outputNames[i] = message.username
        outputMessages[i] = message.message
        i+=1
    resp Http200, $(%* outputNames), $(%* outputMessages)
]#