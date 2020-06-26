#!/usr/bin/env bash

set -euo pipefail

function log {
  echo -e "\033[34;1m${1}\033[0m"
}

here=.
buildDir=$here/build
mkdir -p $buildDir/{ghc,ghcjs}
rm -rf $buildDir/{ghc,ghcjs}/*

log "[GHC] Building tests"
set -x
cp test.c test.hs $buildDir/ghc/
pushd $buildDir/ghc
cc -c -fPIC test.c -o test.c.o
ghc -c -O test.hs -o test.hs.o
ghc -o test test.c.o test.hs.o
popd
set +x

log "[GHC] Running tests"
$buildDir/ghc/test
log "[GHC] Tests OK"

log "[GHCJS] Building tests"
set -x
pushd $here/..
npm install -D
npm run build
popd
cp test.hs test.c test.js $buildDir/ghcjs/
cp $here/../dist/index.js $buildDir/ghcjs/gce.js
pushd $buildDir/ghcjs/
emcc test.c -o test.em.js -s WASM=0 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS="['getTempRet0']" \
  -s EXPORTED_FUNCTIONS="['_fun1', '_fun2', '_fun3', '_fun4', '_fun5', '_fun6', '_fun7', '_fun8', '_fun9', '_fun10', '_fun11']"
cat << EOF | tee webpack.config.js
module.exports = {
    mode: 'development',
    entry: './test.js',
    output: {
        path: __dirname,
        filename: 'test.bundle.js',
        libraryTarget: 'global',
        globalObject: 'global'
    },
    node: {
        fs: 'empty'
    }
}
EOF
npx webpack --config webpack.config.js
ghcjs -o test test.bundle.js test.hs
popd
set +x

log "[GHCJS] Running tests"
node $buildDir/ghcjs/test.jsexe/all.js
log "[GHCJS] Tests OK"