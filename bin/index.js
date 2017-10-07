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
    .description("'ngl serve' builds the library and runs demo in the web.")
    .action(serveCommand)
program.parse(process.argv);
