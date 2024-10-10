import jester
import std/[json, strutils]
import norm/[postgres, types, model]
import ws, ws/jester_extra
import "../models.nim"
import "../websockets.nim"

type PixelQuery* = object
  x*, y*, c*: int

router canvas:
  
  get "/fullcanvas/@xfrom/@yfrom/@xto/@yto":
    try:
      var pixelQuery = @[newPixel()]
      withDb:
        if not db.exists(Pixel, "(x BETWEEN $1 AND $2) AND (y BETWEEN $3 AND $4)", parseInt(@"xfrom"), parseInt(@"xto"), parseInt(@"yfrom"), parseInt(@"yto")):
          resp Http204
        db.select(pixelQuery, "(x BETWEEN $1 AND $2) AND (y BETWEEN $3 AND $4)", parseInt(@"xfrom"), parseInt(@"xto"), parseInt(@"yfrom"), parseInt(@"yto"))
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
    var pixelQuery = newPixel()
    pixelQuery.x = 0
    pixelQuery.y = 0
    pixelQuery.colour = 0
    pixelQuery.userfk = newUser()
    withDb:
      db.insert(pixelQuery)
    for ws in sockets:
      discard ws.send( $(%PixelQuery(x: pixelQuery.x, y: pixelQuery.y, c: pixelQuery.colour)))
    resp Http200

