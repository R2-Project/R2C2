# Quickstart

## Client

For the client you can just release the latest release for you current OS.

## Teamserver

### 🐳 Docker (Recommended)

The easiest way to get the R2C2 Teamserver up and running is using Docker.

### 1. Build the Image

Run the following command in the root of the repository to build the Docker image:

```bash
docker build -t r2c2 .
```

### 2. Configuration Setup

Copy the template configuration file to a usable configuration file:

```bash
cp config.yaml.tpl config.yaml
```

Edit `config.yaml` to set your desired credentials (operators, tokens) and settings.

### 3. Run the Teamserver

Run the container using `docker run`. You should mount your `config.yaml` to configure the server.

For data persistence (users, listeners, agents, and captured files), it is highly recommended to mount the `db` and `loot` directories as volumes.

```bash
# Create local directories for persistence
mkdir -p db loot

# Run the container
docker run -d \
  --name r2c2-server \
  -p 8080:8080 \
  -v "$(pwd)/config.yaml":/app/config/config.yaml \
  -v "$(pwd)/db":/db \
  -v "$(pwd)/loot":/app/loot \
  r2c2-server
```

### Volume Explanations
- **`-v .../config.yaml:/app/config/config.yaml`**: Mounts your local configuration file into the container, allowing you to control settings without rebuilding.
- **`-v .../db:/db`**: Persists the SQLite database so you don't lose active sessions or history when the container stops.
- **`-v .../loot:/app/loot`**: Persists generated payloads, screenshots, and downloaded files.

