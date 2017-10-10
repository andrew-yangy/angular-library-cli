const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const webpack = require('webpack');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
    entry : {
        'app': ['./src/demo/main.ts'],
        'polyfills': './src/demo/polyfills.ts',
        'vendor': './src/demo/vendor.ts',
    },
    devtool: 'eval-source-map',
    output: {
        path: path.join(process.cwd(),'dist'),
        filename: "js/[name].js"
    },
    resolve : {
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
        plugins: [
            new TsConfigPathsPlugin({
                configFileName: 'src/demo/tsconfig.json',
                compiler: 'typescript'
            })
        ]
    },
    resolveLoader: {
        modules: [path.join(__dirname, 'node_modules')]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader?configFileName=./src/demo/tsconfig.json', 'angular2-template-loader'],
                exclude: [/\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/],
            },

            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]?'
            },

            { test: /\.json$/, loader: 'json-loader' },
            // },
            {
                test: /\.component\.css$/,
                use: ['raw-loader']
            },
            {
                test: /\.css$/,
                exclude: /\.component\.css$/,
                use: ['style-loader']
            },
            {test: /\.(scss|sass)$/, exclude: root('src', 'demo', 'style'), loader: 'raw-loader!postcss-loader!sass-loader'},

            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader'}
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.join(process.cwd(),'./src/demo/')
        ),
        new HtmlWebpackPlugin({
            template: './src/demo/index.html',
            chunksSortMode: 'dependency'
        }),
        new CommonsChunkPlugin({
            names: ['vendor', 'polyfills']
        }),
        new ProgressBarPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ]
};
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}