#!/usr/bin/env node
const clear       = require('clear');
const program = require('commander');
const log = require('../lib/log')
const {newCommand, serveCommand} = require("../lib/command");

clear();
log('NGL-CLI');
program
    .command('new <projectName>')
    .description('Creates a new directory and a new Angular library eg. "ngl new <projectName>"')
    .action(name =>newCommand(name))
program
    .command('serve')
    .option('-p, --port', 'port')
    .description("'ngl serve' builds the library and runs demo in the web.")
    .action(options => serveCommand(options))
program.parse(process.argv);
