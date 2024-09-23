import jester
import norm/[postgres, types, model]
import nimcrypto

router auth:
  
  post "/login":
    # try:
    #   let username = request.params["username"]
    #   let password = request.params["password"]
    # except:
    #   resp Http400

    # withDb:
    #   let userQuery = newUser()
      
    resp Http200

  post "/register":
    try:
      let usernameInput = request.params["username"]
      let passwordInput = request.params["password"]
      if usernameInput.length() > 16:
        resp Http400

      withDb:
        let hashedPass = newPaddedStringOfCap[60]($bcrypt(passwordInput, generateSalt(8)))
        let convertedUsername = newStringOfCap[16](usernameInput)
        let userQuery = User()
        userQuery.username = convertedUsername
        userQuery.password = hashedPass

        if db.exists(User, "username = ?", convertedUsername):
          resp Http400

        db.insert(userQuery)
      
      resp Http200

    except:
      resp Http400

