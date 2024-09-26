docker build -t simpleserverimage utils/

docker create --name simpleservercontainer simpleserverimage

docker cp simpleservercontainer:/app/simpleServer .

docker rm simpleservercontainer -f

docker rmi simpleserverimage -f

echo "\nDone, run the server with './simpleServer'"