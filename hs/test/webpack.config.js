module.exports = {
    entry: './test/js-src/index.js',
    output: {
        path: __dirname + '/js-dist/',
        filename: 'index.js',
        libraryTarget: 'var',
        library: 'h$ffi_emscripten__test_module'
    },
    mode: 'development',
    node: { fs: 'empty' }
};
