module.exports = {
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "stream": require.resolve("stream-browserify")
        }
    },
    entry  : './src/index.js',
    output : {
        path     : __dirname,
        filename : './dist/networked-aframe.min.js'
    },
    mode: 'production',
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