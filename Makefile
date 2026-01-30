
DOCKER_IMAGE_NAME := r2c2
CLIENT_DIR := client
CLIENT_OUTPUT_NAME := R2C2

OS := $(shell uname -s)
ifeq ($(OS),Darwin)
	DEFAULT_CLIENT_TARGET := client-macos
else ifeq ($(OS),Linux)
	DEFAULT_CLIENT_TARGET := client-linux
else
	DEFAULT_CLIENT_TARGET := client-windows
endif

.PHONY: all help build server client client-windows client-linux client-macos docker-build clean

all: docker-build $(DEFAULT_CLIENT_TARGET)

help:
	@echo "R2C2 Build System"
	@echo ""
	@echo "Usage:"
	@echo "  make all             - Build Docker server and Client for current OS"
	@echo "  make server          - Build the Server Docker image"
	@echo "  make client          - Build Client for the current OS"
	@echo "  make client-windows  - Build Client for Windows (amd64)"
	@echo "  make client-linux    - Build Client for Linux (amd64)"
	@echo "  make client-macos    - Build Client for macOS (Universal)"
	@echo "  make clean           - Remove build artifacts"
	@echo ""

build:
	@echo "Starting build process..."

server: docker-build

client: $(DEFAULT_CLIENT_TARGET)


docker-build:
	@echo "🐳 Building Server Docker Image: $(DOCKER_IMAGE_NAME)..."
	docker build -t $(DOCKER_IMAGE_NAME) .
	@echo "✅ Docker build complete."

client-macos:
	@echo "🍎 Building Client for macOS (Universal)..."
	cd $(CLIENT_DIR) && wails build -platform darwin/universal
	@echo "✅ Client (macOS) build complete."

client-windows:
	@echo "🪟 Building Client for Windows (amd64)..."
	cd $(CLIENT_DIR) && wails build -platform windows/amd64
	@echo "✅ Client (Windows) build complete."

client-linux:
	@echo "🐧 Building Client for Linux (amd64)..."
	cd $(CLIENT_DIR) && wails build -platform linux/amd64
	@echo "✅ Client (Linux) build complete."

clean:
	@echo "🧹 Cleaning up..."
	cd $(CLIENT_DIR) && rm -rf build/bin/*
	@echo "✅ Clean complete."
