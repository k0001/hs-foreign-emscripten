#!/usr/bin/env bash
set -xeuo pipefail

npm install --save-dev --save-exact \
  ts-loader@7.0.5 \
  typescript@3.9.5 \
  webpack@4.43.0 \
  webpack-cli@3.3.12

# lib/
npx webpack --config lib/webpack.config.js

# test/
emcc test/c-src/funz.c -o test/js-src/funz.js -s WASM=0 -s MODULARIZE=1 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS="['getTempRet0']" \
  -s EXPORTED_FUNCTIONS="['_fun1', '_fun2', '_fun3', '_fun4', '_fun5', '_fun6', '_fun7', '_fun8', '_fun9', '_fun10', '_fun11']"
npx webpack --config test/webpack.config.js

