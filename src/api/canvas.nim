import jester
import norm/[postgres, types, model]
import std/locks
import ws, ws/jester_extra
import "../models.nim"
import "../websockets.nim"

router canvas:
  get "/connect":
    {.gcsafe.}:
      withLock(sockets.lock):
        sockets.connections.add (await newWebSocket(request))
        let connLen = sockets.connections.len
        echo connLen
        echo sockets.connections[connLen - 1].key
      resp Http200

  get "/pingall":
    {.gcsafe.}:
      for conn in sockets.connections:
        await conn.send("ping")
      resp Http200
