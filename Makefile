.PHONY: all server client implant deps-server deps-client deps-implant clean help check-deps

all: check-deps server client implant

help:
	@echo "Available commands:"
	@echo "  make all          - Check system deps, then build server and client"
	@echo "  make server       - Install dependencies and build the server (includes implant deps)"
	@echo "  make client       - Install dependencies and build the client"
	@echo "  make deps-server  - Install Go dependencies for the server"
	@echo "  make deps-client  - Install Go and NPM dependencies for the client"
	@echo "  make deps-implant - Install Rust dependencies for the implant"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make check-deps   - Check and install system dependencies (Go, Rust, Node, etc)"

check-deps:
	@echo "Checking system dependencies..."
	@command -v go >/dev/null 2>&1 || { echo "Installing Go..."; sudo apt-get update && sudo apt-get install -y golang-go; }
	@command -v cargo >/dev/null 2>&1 || { echo "Installing Rust..."; curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; source $$HOME/.cargo/env; }
	@command -v npm >/dev/null 2>&1 || { echo "Installing Node.js/NPM..."; sudo apt-get install -y nodejs npm; }
	@command -v wails >/dev/null 2>&1 || { echo "Installing Wails..."; go install github.com/wailsapp/wails/v2/cmd/wails@latest; export PATH=$$PATH:$$HOME/go/bin; }
	@echo "Checking Linux specific dependencies for Wails..."
	@dpkg -s libgtk-3-dev >/dev/null 2>&1 || { echo "Installing GTK3..."; sudo apt-get install -y libgtk-3-dev; }
	@dpkg -s libwebkit2gtk-4.0-dev >/dev/null 2>&1 || { echo "Installing WebKit2GTK..."; sudo apt-get install -y libwebkit2gtk-4.0-dev; }


server: check-deps deps-server deps-implant
	@echo "Building Server..."
	cd server && go build -o ../bin/server ./cmd/main.go

client: check-deps deps-client
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
