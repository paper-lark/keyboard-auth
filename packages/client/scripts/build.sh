#!/usr/bin/env bash

# Fail if any step fails
set -e

# 1. Build bundle
echo "$(tput setaf 2)1. Creating bundle$(tput sgr0)"
yarn run build:rollup --silent
echo

# 2. Create distributable
echo "$(tput setaf 2)2. Creating distrubutable$(tput sgr0)"
rm -rf build/*
yarn run build:pkg
cp ../../node_modules/grpc/src/node/*/*/grpc_node.node build/
case "$OSTYPE" in
  darwin*)  cp ../../misc/iohook-macos/iohook.node build/ ;;
  *)        cp ../../node_modules/iohook/builds/*/*/*/iohook.node build/ ;;
esac
echo

# 3. Check distrubutable size
echo "$(tput setaf 2)3. Checking distrubutable size$(tput sgr0)"
EXECUTABLE_SIZE=$(du -h build | awk '{print $1}')
echo "Executable size: ${EXECUTABLE_SIZE}"