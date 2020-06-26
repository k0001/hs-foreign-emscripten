#!/usr/bin/env bash
set -xeuo pipefail

cabal --ghcjs build lib:ffi-emscripten

ghcjs test/hs-src/Main.hs test/js-dist/bundle.js -o test/js-dist/out \
  -package-db dist-newstyle/packagedb/ghcjs-* -package ffi-emscripten

node test/js-dist/out.jsexe/all.js
