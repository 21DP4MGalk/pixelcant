import jester
# import norm/[postgres, types, model]
import ws, ws/jester_extra
# import "../models.nim"
import "../websockets.nim"

router canvas:
  
  get "/fullcanvas":
    resp Http200

  get "/updatestream":
    let ws = await newWebSocket(request)
    sockets.add ws
    resp Http200

  post "/placepixel":
    resp Http200

