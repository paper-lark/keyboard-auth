# Keyboard authenticator

Keyboard authenticator is a client-server based application for authenticating users of computational system.

## Build

Prerequisites:
- Proto compiler
- gRPC Tools: `npm install -g grpc-tools`
- Typescript plugin: `npm install -g grpc_tools_node_protoc_ts`

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
