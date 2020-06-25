module.exports = {
    entry: './js-src/index.js',
//    module: {
//        rules: [{
//            test: /\.tsx?$/,
//            use: 'ts-loader',
//            exclude: /node_modules/,
//        }],
//    },
    output: {
        path: __dirname + '/js-dist/',
        filename: 'index.js',
        libraryTarget: 'var',
        library: 'h$ffi_emscripten'
    },
    mode: 'production'
};
