sudo apt update 
sudo apt install postgresql -y
curl https://nim-lang.org/choosenim/init.sh -sSf | sh
echo "CREATE DATABASE pixelcant; CREATE USER pixelcant WITH PASSWORD 'testing123';" | sudo sudo -u postgres psql
cat /workspaces/pixelcant/utils/sql_structure | sudo sudo -u postgres psql -d pixelcant
sudo service postgresql start
nim r /workspaces/pixelcant/src/pixelcant.nim
