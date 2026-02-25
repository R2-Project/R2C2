.PHONY: all server client implant deps-server deps-client deps-implant clean help

all: server client implant

help:
	@echo "Available commands:"
	@echo "  make all          - Build server and client"
	@echo "  make server       - Install dependencies and build the server (includes implant deps)"
	@echo "  make client       - Install dependencies and build the client"
	@echo "  make deps-server  - Install Go dependencies for the server"
	@echo "  make deps-client  - Install Go and NPM dependencies for the client"
	@echo "  make deps-implant - Install Rust dependencies for the implant"
	@echo "  make clean        - Clean build artifacts"

server: deps-server deps-implant
	@echo "Building Server..."
	cd server && go build -o ../bin/server ./cmd/main.go

client: deps-client
	@echo "Building Client..."
	cd client && wails build

deps-server:
	@echo "Downloading Server Go modules..."
	cd server && go mod download

deps-client:
	@echo "Downloading Client Go modules..."
	cd client && go mod download
	@echo "Installing Client Frontend dependencies..."
	cd client/frontend && npm install

deps-implant:
	@echo "Fetching Implant Cargo dependencies..."
	cd implant && cargo fetch

clean:
	@echo "Cleaning up..."
	rm -rf bin
	cd server && go clean
	cd client && rm -rf build/bin
	cd implant && cargo clean
