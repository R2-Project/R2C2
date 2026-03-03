# Client Installation & Usage

This guide details how to build and run the [R2C2](https://github.com/mati-olivera/r2c2) Client dashboard.

> **Note:** This software has been tested primarily on **Kali Linux**. The build process assumes a Debian-based environment for installing dependencies.

## Prerequisites

The project comes with a helper to install all necessary dependencies, including Go, Node.js, NPM, the Wails CLI, and required Linux libraries (GTK3, WebKit2GTK):

```bash
make check-deps
```

*Ensure you have `sudo` privileges as system packages will need to be installed.*

## Building the Client

To build the client application, run the following command from the root of the repository:

```bash
make client
```

This process will:
1.  Install any missing Go and Node.js dependencies.
2.  Build the frontend assets.
3.  Compile the Wails application into a runnable binary.

## Running the Client

After a successful build, the client binary will be located in the `client/build/bin/` directory.

To launch the R2C2 client:

```bash
./client/build/bin/R2C2
```

## Development Mode

If you are developing or debugging the client, you can run it in "dev" mode directly using Wails. This provides hot-reloading for frontend changes.

Navigate to the `client` directory and run:

```bash
cd client
wails dev
```
