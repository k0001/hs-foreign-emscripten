module.exports = {
    entry: './lib/js-src/index.js',
    output: {
        path: __dirname + '/js-dist/',
        filename: 'index.js',
        libraryTarget: 'var',
        library: 'h$ffi_emscripten'
    },
    mode: 'production'
};
