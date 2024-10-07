import jester
import norm/[postgres, types, model]
import std/locks
import ws, ws/jester_extra
import "../models.nim"
import "../websockets.nim"

router canvas:
  get "/connect":
    lockedSockets:
      sockets.add (await newWebSocket(request))
      let connLen = sockets.len
      echo connLen
      echo sockets[connLen - 1].key
    resp Http200

  get "/pingall":
    lockedSockets:
      for conn in sockets:
        echo conn.key
        await conn.send("ping")
    resp Http200
