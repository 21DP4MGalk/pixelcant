import norm/[types, model]

type 
  User* = ref object of Model
    name: StringOfCap[16] = newStringOfCap[16]("")
    banned: bool = false
    admin: bool = false
    password: PaddedStringOfCap[60] = newPaddedStringOfCap[60]("")
    lastpixel: int = 0
    login: PaddedStringOfCap[80] = newPaddedStringOfCap[80]("")
