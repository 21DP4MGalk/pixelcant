FROM nimlang/nim:2.0.8-regular

RUN apt-get update && apt-get install libpq5 -y

WORKDIR /app

COPY pixelcant.nimble .

RUN nimble install -dy

COPY src/ src/

COPY nim.cfg .

RUN nimble build -d:release

EXPOSE 5000

COPY public/ public/

COPY .env .

CMD ./pixelcant
