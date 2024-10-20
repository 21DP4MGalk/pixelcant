import jester
import norm/[postgres, types]
import "../models.nim"
import checksums/bcrypt
import strutils

router user:
  post "/modifyuser":     # takes in the user's old name and lets the admin change it, used to curb innapropriate names
    
    let requestToken = request.cookies["token"]
    let oldName = request.formData["oldName"].body
    var newName = request.formData["newName"].body

    var requestUser = newUser()
    var editUser = newUser()

    withDb:
      assertUserTokenExists(requestToken)
      db.select(editUser, "username = $1", oldName)
      db.select(requestUser, "loginToken = $1", requestToken)
      
      if(not requestUser.admin or newName.len > 16):
        resp Http400
  
      editUser.username = newStringOfCap[16](newName)    

      db.update(editUser)
      resp Http200

  post "/modifyself":      # lets the user modify their own data, takes in the new data and a boolean specifying wether the username is to be changed or the password 
    let userToken = request.cookies["token"]
    let password = request.formData["password"].body      # password for validating the original user is making this request and not someone else at the computer
    let newData = request.formData["newData"].body      # contains either the new username or the password
    let isPass = parseBool(request.formData["isPass"].body) #[Determines wether the data to be edited is the password or the username
                                                  1 - password
                                                  0 - username ]#
    if(not isPass and newData.len > 16):
      resp Http400, "New name is above 16 characters, shorten it."
    withDb:
      assertUserTokenExists(userToken)
      var user = newUser();
      db.select(user, "loginToken = $1", userToken)

      if(isPass):
        let hashedPass = newPaddedStringOfCap[60]($bcrypt(newData, generateSalt(8))) 
        user.password = hashedPass
      else:
        user.username = newStringOfCap[16](newData)
      db.update(user)
      resp Http200

  post "/banuser":      # lets the admin ban a user
    try:
      let requestToken = request.cookies["token"]      # belongs to the requesting user
      let username = request.formData["username"].body     # belongs to our political enemy
      var requestUser = newUser()      # the user making the request
      var bannedUser = newUser()     # the user being banned
      withDb:
        if(not db.exists(User, "loginToken = $1", requestToken)):
          resp Http401, "Your token is invalid, consider logging back in"
        
        db.select(requestUser, "loginToken = $1", requestToken)
        
        if(not requestUser.admin):
          resp Http403, "You are not an administrator"
        
        db.select(bannedUser, "username = $1", username)
        bannedUser.banned = true
        bannedUser.admin = false
        db.update(bannedUser)
        
        resp Http200
    except:
      resp Http500

  get "/admincheck":      # simply checks if the user is an admin or not, unfortunately sends a string instead of a boolean because that just makes sense
    try:
      var token = request.cookies["token"]

      withDb:
        if(db.exists(User, "loginToken = $1 and admin = true", token)):
          resp Http200, "true"
        else:
          resp Http200, "false"
    except:
      resp Http200, "false"
