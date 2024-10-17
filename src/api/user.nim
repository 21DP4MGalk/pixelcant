import jester
import norm/[postgres, types]
import "../models.nim"
import checksums/bcrypt
import strutils

router user:
  post "/modifyuser":
    
    let requestToken = request.formData["token"].body
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

  post "/modifyself":
    let userToken = request.formData["token"].body
    let newData = request.formData["newData"].body
    let isPass = parseBool(request.formData["isPass"].body) #[Determines wether the data to be edited is the password or the username
                                                  1 - password
                                                  0 - username ]#
    if(not isPass and newData.len > 16):
      resp Http400
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
