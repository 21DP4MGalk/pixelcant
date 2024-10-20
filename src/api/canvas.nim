import jester
import std/[json, strutils, times]
import norm/[postgres, types, model]
import ws, ws/jester_extra
import "../models.nim"
import "../websockets.nim"

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
          resp Http204
        db.select(pixelQuery, "(x BETWEEN $1 AND $2) AND (y BETWEEN $3 AND $4)", xfrom, xto, yfrom, yto)
      var queriedPixels: seq[PixelQuery]
      for pixel in pixelQuery:
        queriedPixels.add PixelQuery(x: pixel.x, y: pixel.y, c: pixel.colour)
      resp Http200, $(%* queriedPixels)
    except:
      resp Http500

  get "/updatestream":
    let ws = await newWebSocket(request)
    sockets.add ws
    resp Http200

  post "/placepixel":
    try:
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
        if currentTime - 300 < userQuery.lastpixel:
          resp Http429
        pixelQuery.x = pixelX
        pixelQuery.y = pixelY
        pixelQuery.colour = pixelColour
        pixelQuery.userfk = userQuery
        userQuery.lastpixel = currentTime
        db.insert(pixelQuery)
        db.update(userQuery)
      for ws in sockets:
        discard ws.send( $(%PixelQuery(x: pixelQuery.x, y: pixelQuery.y, c: pixelQuery.colour)))
      resp Http200
    except:
      resp Http401
