// @ts-check
// Helper: root() is defined at the bottom
const path = require('path');
const webpack = require('webpack');

// Webpack Plugins
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');


/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === 'build-demo';

module.exports = function makeWebpackConfig() {
    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    let config = {};

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (isProd) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval-source-map';
    }

    /**
       * Entry
       * Reference: http://webpack.github.io/docs/configuration.html#entry
       */
    config.entry = {
        'app': './src/demo/main.ts', // our angular app,
        'polyfills': './src/demo/polyfills.ts',
        'vendor': './src/demo/vendor.ts',
    };

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     */
    config.output = {
        path: root('dist'),
        publicPath: isProd ? 'train-module' : 'http://localhost:8080/',
        filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
        chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
    };

    /**
     * Resolve
     * Reference: http://webpack.github.io/docs/configuration.html#resolve
     */
    config.resolve = {
        // only discover files that have those extensions
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
        plugins: [
            new TsConfigPathsPlugin({
                configFileName: 'src/demo/tsconfig.json',
                compiler: 'typescript'
            })
        ]
    };

    /**
     * Loaders
     * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */
    config.module = {
        rules: [
            // Support for .ts files.
            {
              test: /\.ts$/,
              loaders: ['awesome-typescript-loader?configFileName=./src/demo/tsconfig.json', 'angular2-template-loader', '@angularclass/hmr-loader'],
              exclude: [/\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/],
            },

            // copy those assets to output
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]?'
            },

            // Support for *.json files.
            { test: /\.json$/, loader: 'json-loader' },
            // {
            //   test: /\.css$/,
            //   loaders: ['to-string-loader', 'css-loader']
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
            // all scss files in app demo style will be merged to index.html
            {
                test: /\.scss$/,
                include: root('src', 'demo', 'style'),
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader', 'postcss-loader']})
            },


            // all css required in src/lib files will be merged in js files
            {test: /\.(scss|sass)$/, exclude: root('src', 'demo', 'style'), loader: 'raw-loader!postcss-loader!sass-loader'},

            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader'}
        ]
    };

    config.module.rules.push({
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader'
    });

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        // Define env constiables to help with builds
        // Reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
        new webpack.DefinePlugin({
            // Environment helpers
            'process.env': {
                ENV: JSON.stringify(ENV)
            }
        }),

        // Workaround needed for angular 2 angular/angular#11580
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            root('./src/demo/') // location of your src
        ),

        // Tslint configuration for webpack 2
        new webpack.LoaderOptionsPlugin({
            options: {
                /**
                 * Apply the tslint loader as pre/postLoader
                 * Reference: https://github.com/wbuchwalter/tslint-loader
                 */
                tslint: {
                    emitErrors: false,
                    failOnHint: false
                },
                /**
                 * Sass
                 * Reference: https://github.com/jtangelder/sass-loader
                 * Transforms .scss files to .css
                 */
                sassLoader: {
                    //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")]
                },
                /**
                 * PostCSS
                 * Reference: https://github.com/postcss/autoprefixer-core
                 * Add vendor prefixes to your css
                 */
                postcss: [
                    autoprefixer({
                        browsers: ['last 2 version']
                    })
                ]
            }
        })
    ];


    config.plugins.push(
        // Generate common chunks if necessary
        // Reference: https://webpack.github.io/docs/code-splitting.html
        // Reference: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        new CommonsChunkPlugin({
            names: ['vendor', 'polyfills']
        }),

        // Inject script and link tags into html files
        // Reference: https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            template: './src/demo/index.html',
            chunksSortMode: 'dependency'
        }),

        // Extract css files
        // Reference: https://github.com/webpack/extract-text-webpack-plugin
        // Disabled when in test mode or not in build mode
        new ExtractTextPlugin({ filename: 'css/[name].[hash].css', disable: !isProd })
    );


    // Add build specific plugins
    if (isProd) {
        config.plugins.push(
            // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
            // Only emit files when there are no errors
            new webpack.NoEmitOnErrorsPlugin(),

            // // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
            // // Dedupe modules in the output
            // new webpack.optimize.DedupePlugin(),

            // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            // Minify all javascript, switch loaders to minimizing mode
            new webpack.optimize.UglifyJsPlugin({ sourceMap: true, mangle: { keep_fnames: true } })
        );
    }

    config.plugins.push(
        // Copy assets from the public folder
        // Reference: https://github.com/kevlened/copy-webpack-plugin
        new CopyWebpackPlugin([{
            from: root('src/demo/assets')
        }])
    );

    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {
        contentBase: './src/demo',
        historyApiFallback: true,
        stats: 'normal' // none (or false), errors-only, minimal, normal (or true) and verbose
    };

    return config;
}();

// Helper functions
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}
