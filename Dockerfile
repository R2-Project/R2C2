
FROM golang:1.24 AS builder

WORKDIR /app

COPY server/go.mod server/go.sum ./server/
WORKDIR /app/server
RUN go mod download

COPY server/ ./

RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o teamserver ./cmd/main.go

FROM rust:slim-bookworm

RUN apt-get update && apt-get install -y \
    mingw-w64 \
    gcc \
    libc6-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN rustup target add x86_64-pc-windows-gnu

WORKDIR /app

COPY --from=builder /app/server/teamserver ./teamserver

COPY implant/ ./implant/

RUN mkdir -p ./loot ./db ./config /tmp/payloads

COPY config.yaml ./config.yaml


VOLUME ["./config.yaml", "./loot", "./db", "/tmp/payloads"]

ENV GIN_MODE=release
ENV IMPLANT_SOURCE_PATH=/app/implant

ENTRYPOINT ["./teamserver", "server", "--start", "--config", "./config.yaml"]
