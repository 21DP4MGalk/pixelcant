import std/locks
import ws

type Sockets = object
  connections*: seq[WebSocket]
  lock*: Lock

var sockets* = Sockets(connections: newSeq[WebSocket]())
