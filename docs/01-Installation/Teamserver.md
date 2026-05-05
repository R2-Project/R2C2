# Teamserver Installation & Usage

This guide details how to build and run the [R2C2](https://github.com/mati-olivera/r2c2) Teamserver.

> **Note:** The server has been tested only on **Kali Linux**.

## Prerequisites

The project includes a helper to check and install necessary dependencies (Go, Rust, Node.js, Wails, etc.):

```bash
make check-deps
```

*`check-deps` will attempt to install missing packages using `sudo` if available. If `sudo` is not present, it will skip installation of already-present packages gracefully.*

## Building the Server

To build the server binary, run:

```bash
make server
```

This process will:
1.  Install missing dependencies.
2.  Download Go modules for the server.
3.  Fetch Rust dependencies for the implant.
4.  Compile the server binary to `bin/server`.

## Configuration

The server requires a YAML configuration file.

1.  Create a configuration file from the template:
    ```bash
    cp config.yaml.tpl config.yaml
    ```

2.  Edit `config.yaml` to customize settings like the database path, API keys for AI integration, and operator credentials.
    
    *   **Configuration Note:** Check the `database_path` in `config.yaml`. Ensure it points to a valid location relative to where you will run the server. For example, if running from the root directory, you might set it to `./db/r2c2.db`.

## Running the Server

Execute the server binary from the project root, specifying the configuration file:

```bash
./bin/teamserver --start --config config.yaml
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `IMPLANT_SOURCE_PATH` | Absolute path to the `implant/` directory. Required if the server's working directory differs from the project root. | `../implant` (relative) |

Example:
```bash
export IMPLANT_SOURCE_PATH=/path/to/R2C2/implant
./bin/teamserver --start --config config.yaml
```

If successful, the server will start listening on the address defined in your config (default: `0.0.0.0:8080`).

