sudo apt update 
sudo apt install postgresql -y
curl https://nim-lang.org/choosenim/init.sh -sSf | sh
echo "CREATE DATABASE pixelcant; CREATE USER pixeluser WITH PASSWORD 'testing123';" | sudo sudo -u postgres psql -c
cat /workspaces/pixelcant/utils/sql_structure | sudo sudo -u postgres psql -d pixelcant -c
echo "GRANT ALL PRIVILEGES ON DATABASE pixelcant to pixeluser;" | sudo sudo -u postgres psql -c
sudo service postgresql start
cp /workspaces/pixelcant/utils/dotenv_example /workspaces/pixelcant/.env
nim r /workspaces/pixelcant/src/pixelcant.nim
