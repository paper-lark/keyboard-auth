#!/usr/bin/env bash

INCLUDE_DIR=./proto
PROTO_FILES=./proto/*.proto
DEST_DIR=./proto/__generated__

# create destination directory
mkdir -p ${DEST_DIR}

# generate js codes via grpc-tools
grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:${DEST_DIR} \
    --grpc_out=${DEST_DIR} \
    --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
    -I ${INCLUDE_DIR} \
    ${PROTO_FILES}

# generate d.ts codes
protoc \
    --plugin=protoc-gen-ts=`which protoc-gen-ts` \
    --ts_out=${DEST_DIR} \
    -I ${INCLUDE_DIR} \
    ${PROTO_FILES}

# create copies in all packages
rm -rf ./server/src/api/__generated__
rm -rf ./client/src/api/__generated__
cp -r ${DEST_DIR} ./server/src/api/__generated__
cp -r ${DEST_DIR} ./client/src/api/__generated__