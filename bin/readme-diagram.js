#!/usr/bin/env node
const Parser = require('../index');

let file = '';

for(let i = 0; i < process.argv.length; i++) {
    if(process.argv[i] === '--file' && process.argv[i + 1]) {
        file = process.argv[i + 1];
        break;
    }
}

if(!file) {
    return;
}

let parser = new Parser(file);
parser.processFile();
