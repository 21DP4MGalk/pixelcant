# Package

version       = "0.1.0"
author        = "21DP4KLogi"
description   = "Server for pixelcan't - https://github.com/21DP4MGalk/pixelcant"
license       = "AGPL-3.0"
srcDir        = "src"
bin           = @["pixelcant"]


# Dependencies

requires "httpbeast >= 0.4.2"
requires "nim >= 1.0.0"
requires "jester"
requires "norm"
requires "checksums"
requires "dotenv"
requires "ws"
