import norm/[types, model]

type 
  User* {.tableName: "users".} = ref object of Model
    name*: StringOfCap[16] = newStringOfCap[16]("")
    banned*: bool = false
    admin*: bool = false
    password*: PaddedStringOfCap[60] = newPaddedStringOfCap[60]("")
    lastpixel*: int = 0
    login*: PaddedStringOfCap[80] = newPaddedStringOfCap[80]("")

type
  Pixel* {.tableName: "pixels".} = ref object of Model
    x*: int
    y*: int
    colour*: int16
    userid* {.fk User.} : int

type
  Message* {.tableName: "messages".} = ref object of Model
    timestamp*: int
    message*: StringOfCap[300] = newStringOfCap[300]("")
    userid* {.fk User.} : int
    
func newUser*(): User =
  User()

func newPixel*(): Pixel = 
  Pixel()

func newMessage*(): Message = 
  Message()
