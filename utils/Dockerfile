FROM nimlang/nim:2.0.4-regular

WORKDIR /app

COPY simpleServer .

RUN nimble install jester -y

RUN nim c simpleServer.nim
