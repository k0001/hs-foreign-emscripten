#!/usr/bin/env bash
set -x

npm install --save-dev webpack webpack-cli

# lib/
npx webpack --config lib/webpack.config.js
