import norm/[types, model, pragmas]
import std/options

type 
  User* {.tableName: "Users".} = ref object of Model
    name*: StringOfCap[16] = newStringOfCap[16]("")
    banned*: bool = false
    admin*: bool = false
    password*: PaddedStringOfCap[60] = newPaddedStringOfCap[60]("")
    lastpixel*: int = 0
    loginToken*: Option[PaddedStringOfCap[128]] = none PaddedStringOfCap[128]
  Message* {.tableName: "Messages".} = ref object of Model
    message*: StringOfCap[300] = newStringOfCap[300]("")
    time*: int = 0
    userfk*: User
  Pixel* {.tableName: "Pixels".} = ref object of Model
    x*: int16
    y*: int16
    colour*: int16 = 0
    userfk*: User
    
func newUser*(): User =
  User()

func newMessage*(): Message =
  Message(userfk: newUser())

func newPixel*(): Pixel = 
  Pixel(x: 0, y: 0, userfk: newUser())
