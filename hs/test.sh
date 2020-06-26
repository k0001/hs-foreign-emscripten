#!/usr/bin/env bash
set -x

rm test/js-src/funz.js
rm -rf test/out.jsexe
rm -rf test/js-dist
find test/ -name *.js_o -exec rm {} ';'
find test/ -name *.js_hi -exec rm {} ';'

cabal clean
cabal --ghcjs build lib:ffi-emscripten

# npm install --save-dev webpack webpack-cli

# test/
emcc test/c-src/funz.c -o test/js-src/funz.js -s WASM=0 -s MODULARIZE=1 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS="['getTempRet0']" \
  -s EXPORTED_FUNCTIONS="['_fun1', '_fun2', '_fun3', '_fun4', '_fun5', '_fun6', '_fun7', '_fun8', '_fun9', '_fun10', '_fun11']"

npx webpack --config test/webpack.config.js

ghcjs test/hs-src/Main.hs test/js-dist/index.js -o test/out \
  -package-db dist-newstyle/packagedb/ghcjs-* -package ffi-emscripten

node test/out.jsexe/all.js
