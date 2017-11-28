const fs = require('fs-extra');
const path = require('path');
const log = require('./log');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const replace = require('replace-in-file');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const dest = path.join(__dirname,'/../template');

const newCommand = (name) => {
    let status = new Spinner('Copying template, please wait...');
    status.start();
    if(fs.existsSync(name)) {
        log.fatal('Destination folder ' + name + ' already exists.')
    } else {
        fs.copySync(dest, name);
        try {
            console.log(path.join(process.cwd(), name,'package.json'));
            const changes = replace.sync({
                files: [
                    path.join(process.cwd(), name,'package.json'),
                    path.join(process.cwd(), name,'/src/lib/*.json')
                ],
                from: /quickstart-lib/g,
                to: name,
            });
            console.log('Modified files:', changes.join(', '));
        }
        catch (error) {
            console.error('Error occurred:', error);
        }
        status.stop();
        log.success('Angular library generated successfully.')
    }
};
const serveCommand = (cmd) => {
    let port = cmd.port || 8080;
    const configDir = '../webpack.config';
    const webpackConfig = require(`${configDir}`);
    let modulesDir = path.resolve(__dirname,'../node_modules');
    webpackConfig.entry.app.unshift(modulesDir + "/webpack-dev-server/client?http://localhost:" + port + '/', modulesDir + "/webpack/hot/dev-server");
    let webpackCompiler = webpack(webpackConfig);
    let server = new WebpackDevServer(webpackCompiler, {
        contentBase: './src/demo/',
        historyApiFallback: true,
        inline: true,
        hot: true,
        stats: 'normal',
        clientLogLevel: 'none'
        // stats: { colors: true }
    });
    server.listen(port);
};
module.exports = {newCommand, serveCommand};