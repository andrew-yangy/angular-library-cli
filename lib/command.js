const fs = require('fs-extra');
const path = require('path');
const log = require('./log')
const CLI         = require('clui');
const Spinner     = CLI.Spinner;

const newCommand = (name) => {
    let status = new Spinner('Copying template, please wait...');
    status.start();
    if(fs.existsSync(name)) {
        log.fatal('Destination folder ' + name + ' already exists.')
    } else {
        let dest = path.join(__dirname,'/../template');
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
}
const setupCommand = () => {
    //todo: other cmds
    console.log('setup');
}
module.exports = {newCommand, setupCommand}