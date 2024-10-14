import jester
import norm/[postgres, types, model]
import checksums/bcrypt
import strutils
import "../models.nim"

router auth:
  
  post "/login":
    try:
      let username = request.params["username"]
      let password = request.params["password"]
    # withDb:
    #   let userQuery = newUser()
      
      resp Http200
    except:
      resp Http400

  post "/register":
    try:
      let nameInput = request.formData["name"].body
      let passwordInput = request.formData["password"].body
      if nameInput.len > 16:
        resp Http400

      withDb:
        let hashedPass = newPaddedStringOfCap[60]($bcrypt(passwordInput, generateSalt(8)))
        let convertedName = newStringOfCap[16](nameInput)
        var userQuery = newUser()
        userQuery.name = convertedName
        userQuery.password = hashedPass

        if db.exists(User, "name = $1", convertedName):
          resp Http400

        db.insert(userQuery)
      
      resp Http200

    except:
      resp Http400

