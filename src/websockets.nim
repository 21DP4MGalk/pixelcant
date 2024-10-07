import std/locks
import ws

var socketLock*: Lock
initLock(socketLock)

var sockets* {.guard: socketLock.} = newSeq[WebSocket]()

template lockedSockets*(body: untyped) =
  {.gcsafe.}:
    withLock(socketLock):
      body
