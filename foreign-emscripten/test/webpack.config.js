module.exports = {
    mode: 'development',
    entry: __dirname + '/js-src/index.js',
    output: {
        path: __dirname + '/js-dist/',
        filename: 'bundle.js',
        libraryTarget: 'var',
        library: 'h$ffi_emscripten__test_module'
    },
    resolve: {
        extensions: ['.js']
    },
    node: {
        fs: 'empty'
    }
};
