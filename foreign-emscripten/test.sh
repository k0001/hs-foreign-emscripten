#!/usr/bin/env bash
set -xeuo pipefail

cabal clean
cabal --ghcjs build lib:foreign-emscripten

ghcjs test/hs-src/Main.hs test/js-dist/bundle.js -o test/js-dist/out \
  -package-db dist-newstyle/packagedb/ghcjs-* -package foreign-emscripten

node test/js-dist/out.jsexe/all.js
