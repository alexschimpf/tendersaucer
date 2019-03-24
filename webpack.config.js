const path = require('path');

const ROOT = path.resolve(__dirname);
const STATIC_DIR = './tendersaucer/static';
const DIST_DIR = './tendersaucer/dist';
const ENV = process.env.NODE_ENV;
const IS_PROD = ENV == 'production';

const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const LiveReloadPlugin = require('webpack-livereload-plugin');

function dir(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [ROOT].concat(args));
}

module.exports = function (options) {
    return {
        mode: ENV,
        entry: {
            'app': STATIC_DIR + '/app.jsx'
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            modules: [dir(STATIC_DIR), dir('node_modules')]
        },
        output: {
            path: dir(DIST_DIR),
            publicPath: '/static/',
            filename: IS_PROD ? '_[name].[hash].bundle.min.js' : '_[name].bundle.min.js',
            sourceMapFilename: '_[name].map',
            chunkFilename: '_[id].chunk.js',
            library: 'tendersaucer_[name]',
            libraryTarget: 'var'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: [/node_modules/, /\.(spec|e2e)\.js$/],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins: ['@babel/plugin-syntax-dynamic-import']
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        IS_PROD ? MiniCssExtractPlugin.loader :'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    exclude: [/node_modules/],
                    use: [
                        { loader: IS_PROD ? MiniCssExtractPlugin.loader : 'style-loader' },
                        { loader: 'css-loader', options: { sourceMap: true } },
                        { loader: 'sass-loader', options: { sourceMap: true } }
                    ]
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader'
                },
                {
                    test: /\.(png|jpg|jpeg|otf|woff|woff2|eot|svg|gif|ico|ttf)$/,
                    use: 'url-loader?limit=25000&name=_[name].[ext]'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: STATIC_DIR + '/index.html',
                filename: '_index.html',
                chunks: ['app'],
                chunksSortMode: 'dependency',
                inject: 'body'
            }),
            IS_PROD ? new MiniCssExtractPlugin({
                filename: "_[name].[hash].css",
                chunkFilename: "_[id].css"
            }) : null
        ].filter(Boolean),
        optimization: {
            splitChunks: {
                chunks: 'async',
                minChunks: 2
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        },
        devtool: IS_PROD ? 'source-map' : 'cheap-module-source-map'
    }
}