import jester
import norm/[postgres, types, model]
import checksums/bcrypt
import std/[strutils, sysrand, options]
import "../models.nim"

proc generateAuthToken*(): string =
  let byteseq = urandom(64)
  for entry in byteseq:
    result.add(entry.toHex)

router auth:
  
  post "/login":
    try:
      let username = request.formData["username"].body
      let password = request.formData["password"].body
      withDb:
        if not db.exists(User, "username = $1", username):
          resp Http400
        var userQuery = newUser()
        db.select(userQuery, "username = $1", username)
        if not bcrypt.verify(password, $userQuery.password):
          resp Http400
        let authToken = generateAuthToken()
        userQuery.loginToken = some newPaddedStringOfCap[128](authToken)
        setCookie("token", authToken, daysForward(7), Strict, true, true, path="/")
        db.update(userQuery)
      resp Http200
    except:
      resp Http500

#  post "/logout":
#    try:


  post "/register":
    try:
      let nameInput = request.formData["username"].body
      let passwordInput = request.formData["password"].body
      if nameInput.len > 16:
        resp Http400

      withDb:
        let hashedPass = newPaddedStringOfCap[60]($bcrypt(passwordInput, generateSalt(8)))
        let convertedName = newStringOfCap[16](nameInput)
        var userQuery = newUser()
        userQuery.username = convertedName
        userQuery.password = hashedPass
        userQuery.admin = false
        userQuery.banned = false
        userQuery.lastpixel = 0
    
        if db.exists(User, "username = $1", convertedName):
          resp Http400

        let authToken = generateAuthToken()
        setCookie("token", authToken, daysForward(7), Strict, true, true, path="/")
        
        userQuery.loginToken = some PaddedStringOfCap[128](authToken)
        
        db.insert(userQuery)
      resp Http201

    except:
      echo getCurrentExceptionMsg() 
      resp Http500

