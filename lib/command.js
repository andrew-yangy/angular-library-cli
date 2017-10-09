const fs = require('fs-extra');
const path = require('path');
const log = require('./log');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const childProcess = require('child_process');

const dest = path.join(__dirname,'/../template');

const newCommand = (name) => {
    let status = new Spinner('Copying template, please wait...');
    status.start();
    if(fs.existsSync(name)) {
        log.fatal('Destination folder ' + name + ' already exists.')
    } else {
        fs.copySync(dest, name);
        let packageFile,
            filePath;
        try {
            filePath = path.join(process.cwd(), name,'package.json');
            packageFile = require(filePath);
        }catch (e) {
            log.fatal(e)
        }
        packageFile.name = name;
        fs.writeFileSync(filePath, JSON.stringify(packageFile, null, 4));
        status.stop();
        log.success('Angular library generated successfully.')
    }
};
const serveCommand = () => {
    const webpackConfig = require('../webpack.config');
    webpackConfig.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
    let webpackCompiler = webpack(webpackConfig);
    let server = new WebpackDevServer(webpackCompiler, {
        contentBase: './src/demo/',
        historyApiFallback: true,
        inline: true,
        hot: true,
        stats: 'normal'
        // stats: { colors: true }
    });
    server.listen(8080);
    // childProcess.fork(path.join(__dirname,'/../node_modules/webpack-dev-server/bin/webpack-dev-server'),['--inline', '--progress']);
};
module.exports = {newCommand, serveCommand};