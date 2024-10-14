if [ ! -f .env ]; then
    echo "DB_HOST=localhost
DB_USER=postgres
DB_PASS=hunter2
DB_NAME=pixelcant
DB_STARTUP_TIMEOUT=5" > .env
fi

docker compose -f utils/compose.yaml --project-directory . up -d

echo "Server is up! Write 'docker compose down' to shut it down"