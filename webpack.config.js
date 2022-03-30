module.exports = {
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "stream": require.resolve("stream-browserify"),
            "crypto": false,
            "zlib": false,
            "http": false,
            "os": false,
            "tty": false,
            "https": false,
            "vm": false,
            "assert": false
        }
    },
    entry  : './src/index.js',
    output : {
        path     : __dirname,
        filename : './dist/networked-aframe.js'
    },
    mode: 'development',
    module : {
        rules: [
            {
                test: /.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
