import jester
import norm/[postgres]
import "../models.nim"
import checksums/bcrypt

router user:
  post "/modifyuser":
    
    let requestToken = request.formData["token"].body
    let oldName = request.formData["oldName"].body
    var newName = request.formData["newName"].body

    var requestUser = newUser()
    var editUser = newUser()

    dbConn.select(editUser, "username = ?", oldName)
    dbConn.select(requestUser, "token = ?", requestToken)
    
    if(not requestUser.admin || newName.len > 16):
      resp Http400
 
    editUser.username = newName    

    dbConn.update(editUser)
    resp Http200

  post "modifyself":
    let userToken = request.formData("token").body
    let newData = request.formData("newData").body
    let isPass = request.formData("isPass").body #[Determines wether the data to be edited is the password or the username
                                                  1 - password
                                                  0 - username ]#
    if(not isPass && newData.len > 16):
      resp Http400

    var user = newUser();
    dbConn.select(user, "token = ?", userToken)

    if(isPass):
      let hashedPass = newPaddedStringOfCap[60]($bcrypt(newData, generateSalt(8))) 
      user.password = hashedPass
    else:
      user.username = newData
    dbConn.update(user)
    resp Http200