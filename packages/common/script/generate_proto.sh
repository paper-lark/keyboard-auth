#!/usr/bin/env bash

INCLUDE_DIR=./src/api
PROTO_FILES=./src/api/*.proto
DEST_DIR=./lib/api

# create destination directory
mkdir -p ${DEST_DIR}

# generate js codes via grpc-tools
./node_modules/.bin/grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:${DEST_DIR} \
    --grpc_out=${DEST_DIR} \
    --plugin=protoc-gen-grpc='node_modules/.bin/grpc_tools_node_protoc_plugin' \
    -I ${INCLUDE_DIR} \
    ${PROTO_FILES}

# generate d.ts codes
protoc \
    --plugin=protoc-gen-ts='node_modules/.bin/protoc-gen-ts' \
    --ts_out=${DEST_DIR} \
    -I ${INCLUDE_DIR} \
    ${PROTO_FILES}