const chalk = require('chalk');
const figlet      = require('figlet');

const log = (name) => {
    console.log(
        chalk.yellow(
            figlet.textSync(name, { horizontalLayout: 'full' })
        )
    );
};
log.success = (message) => {
    console.log(
        chalk.green(
            message
        )
    );
}
log.fatal = (message) => {
    console.log(
        chalk.red(
            message
        )
    );
    process.exit(1);
}
module.exports = log