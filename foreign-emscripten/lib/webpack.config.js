module.exports = {
    mode: 'production',
    entry: __dirname + '/js-src/index.js',
    output: {
        path: __dirname + '/js-dist/',
        filename: 'bundle.js',
        libraryTarget: 'var',
        library: 'h$ffi_emscripten'
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: __dirname + '/tsconfig.json'
                }
            }]
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
};
