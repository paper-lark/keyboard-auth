# Keyboard authenticator

Keyboard authenticator is a client-server based application for authenticating users of computational system.
Client side was tested on Windows 10, macOS 10.14.5 and Ubuntu 18.04.1.

The project uses Yarn and Lerna for package management.

## Build

Prerequisites:
- Proto compiler

To install dependencies and link local packages, run:

```bash
npx lerna bootstrap --ci
```

## How to start

### Server

To run the server you need a PostgreSQL server. DB connection parameters can be specified with the following environment variables:
- PG_HOST
- PG_PORT
- PG_USER
- PG_PASSWORD
- PG_DB

To start the server, run the following command in **packages/server**:

```bash
yarn run start:dev
```

### Client

Client can be configured using a configuration file. It will be created automatically on the first run. The exact location depends on the OS:
- **$HOME/.config/authenticator/config.json** – for Linux/macOS
- **%APPDATA%/Authenticator/config.json** – for Windows

To run client run the following command in **packages/client**:

```bash
yarn run start:dev
```

## FAQ

Q. After the first keyboard event the following events are not registered on macOS.

A. There is a bug in the `libuiohook` library used to intercept keyboard events as described [here](https://github.com/wilix-team/iohook/issues/124#issuecomment-513026388). The solution is to do the following:

- Clone `iohook` in the root directory of the project: `git clone https://github.com/wilix-team/iohook.git iohook`
- Move to the directory: `cd iohook`
- Comment line libuiohook/src/darwin/input_hook.c:380 and save file
- Install build tools: `brew install cmake automake libtool pkg-config && npm i -g cmake-js`
- Build iohook: `npm run build`
- Replace file in `../client/node_modules/iohook/builds/<your_platform_folder>/build/Release/iohook.node` with file `build/Release/iohook.node`
- Now you can delete cloned folder: `mv .. && rm -rf iohook`
