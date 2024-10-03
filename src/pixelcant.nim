import jester
import norm/[postgres, types, model]
import dotenv
import checksums/bcrypt
import os, strutils, json, options
import "models.nim"
import "api"/["auth.nim"]

settings:
  numThreads = 1

overload()  # Load dotenv file
let dbhost = getEnv("DB_HOST")
let dbuser = getEnv("DB_USER")
let dbpass = getEnv("DB_PASS")
let dbname = getEnv("DB_NAME")
let dbtimeout = parseInt(getEnv("DB_STARTUP_TIMEOUT", "5"))

proc dbAwaitRunning(): DbConn =
  echo "Connecting to database:"
  for i in 1..dbtimeout:
    echo "Attempt: " & $i
    try:
      return open(dbhost, dbuser, dbpass, dbname)
    except:
      sleep(1000)
      continue
  raise newException(DbError, "Could not connect to database")
 
let dbConn = dbAwaitRunning()
echo "Connected to database"

dbConn.createTables(newUser())
dbConn.createTables(newMessage())
dbConn.createTables(newPixel())

routes:

  extend auth, "/auth"
