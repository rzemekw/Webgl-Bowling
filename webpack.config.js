const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    devServer: {
        open: true
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                type: 'javascript/auto',
                test: /\.(png|jpe?g|gif|json|glsl)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "public/**/*",
                    to: "[name].[ext]",
                }
            ]
        }),
    ]
}
