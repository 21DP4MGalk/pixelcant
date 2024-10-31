import jester
import std/[os, json, strutils, times]
import dotenv
import norm/[postgres, model]
import ws, ws/jester_extra
import "../models.nim"
import "../websockets.nim"

overload()
let pixelInterval* = parseInt(getEnv("PIXEL_INTERVAL", "5"))

type PixelQuery* = object
  x*, y*, c*: int16

router canvas:
  
  get "/fullcanvas/@xfrom/@yfrom/@xto/@yto":
    try:
      let
        xfrom = parseInt(@"xfrom")
        xto = parseInt(@"xto")
        yfrom = parseInt(@"yfrom")
        yto = parseInt(@"yto")
      var pixelQuery = @[newPixel()]
      withDb:
        if not db.exists(Pixel, "(x BETWEEN $1 AND $2) AND (y BETWEEN $3 AND $4)", xfrom, xto, yfrom, yto):
          resp Http200, "[]"
        db.select(pixelQuery, "(x BETWEEN $1 AND $2) AND (y BETWEEN $3 AND $4)", xfrom, xto, yfrom, yto)
      var queriedPixels: seq[PixelQuery]
      for pixel in pixelQuery:
        queriedPixels.add PixelQuery(x: pixel.x, y: pixel.y, c: pixel.colour)
      resp Http200, $(%* queriedPixels)
    except:
      resp Http500

  get "/updatestream":
    let ws = await newWebSocket(request)
    socketsPixels.add ws
    resp Http200

  post "/placepixel":
    # try:
      let
        token = request.cookies["token"]
        parsedBody = parseJson(request.body)
        pixelX = parsedBody["x"].getInt.int16
        pixelY = parsedBody["y"].getInt.int16
        pixelColour = parsedBody["c"].getInt.int16  
        currentTime = epochTime().int
      var pixelQuery = newPixel()
      withDb:
        assertUserTokenExists(token)
        selectUserWithToken(token)
        if userQuery.banned:
          resp Http403
        if currentTime - pixelInterval < userQuery.lastpixel:
          resp Http429
        if db.exists(Pixel, "x = $1 and y = $2", pixelX, pixelY):
          db.select(pixelQuery, "x = $1 and y = $2", pixelX, pixelY)
          pixelQuery.colour = pixelColour
          pixelQuery.userfk = userQuery
          db.update(pixelQuery)
        else:
          pixelQuery.colour = pixelColour
          pixelQuery.userfk = userQuery
          pixelQuery.x = pixelX
          pixelQuery.y = pixelY
          db.insert(pixelQuery)
        userQuery.lastpixel = currentTime
        db.update(userQuery)
      for ws in socketsPixels:
        discard ws.send( $(%PixelQuery(x: pixelQuery.x, y: pixelQuery.y, c: pixelQuery.colour)))
      resp Http200, $ currentTime
    # except:
    #   resp Http401
  
  post "/getusercanvas":
    
    var token = request.cookies["token"]
    var username = request.formData["username"].body
    var pixelArr = @[newPixel()]
    var requestUser = newUser()
    var offendingUser = newUser()

    withDb:
      
      if(not db.exists(User, "loginToken = $1", token)):
        resp Http403, "Token not found in database"
     
      db.select(requestUser, "loginToken = $1", token)
     
      if(not requestUser.admin):
        resp Http403, "You're not admin"

      if(not db.exists(User, "username = $1", username)):
        resp Http400, "Username does not exist"

      db.select(offendingUser, "username = $1", username)


      if(not db.exists(Pixel, "(x BETWEEN 0 AND 1000) AND (y BETWEEN 0 AND 1000) AND userfk = $1", offendingUser.id)):
        resp Http200, "[]"

      db.select(pixelArr, "(x BETWEEN 0 AND 1000) AND (y BETWEEN 0 AND 1000) AND userfk = $1", offendingUser.id)
      
      var outputArr: seq[PixelQuery]
      
      for pixel in pixelArr:
        outputArr.add PixelQuery(x: pixel.x, y: pixel.y, c: pixel.colour)
      
      resp Http200, $(%* outputArr)
