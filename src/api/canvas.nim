import jester
# import norm/[postgres, types, model]
import ws, ws/jester_extra
# import "../models.nim"
import "../websockets.nim"

router canvas:
  get "/connect":
    let ws = await newWebSocket(request)
    sockets.add ws
    resp Http200

  get "/pingall":
    for sock in sockets:
      discard sock.send("pling")
    resp Http200
