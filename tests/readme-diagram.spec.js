const test = require('ava');
const Parser = require('../index');
const path = require('path');
const fs = require('fs');

const diagramDir = path.resolve(__dirname, './diagrams');

test.beforeEach(async () => {
    //clear diagrams directory
    let files = fs.readdirSync(diagramDir).map((file) => {
        return path.resolve(diagramDir, file);
    });

    for(let i in files) {
        fs.unlinkSync(files[i]);
    }
});

test.afterEach(async () => {
    //clear diagrams directory
    let files = fs.readdirSync(diagramDir).map((file) => {
        return path.resolve(diagramDir, file);
    });

    for(let i in files) {
        fs.unlinkSync(files[i]);
    }
});

test('should create diagram', async (t) => {
    const readmeFile = './tests/text.md';

    let parser = new Parser(readmeFile);
    let file = await parser.processFile();
    
    t.is(4, file.length);
    t.is('diagrams/jwt-sequence-diagram.svg', file[0].name);
    t.is('diagrams/jwt-flowchart-diagram.svg', file[1].name);
    t.is('diagrams/jwt-dot-diagram.svg', file[2].name);
    t.is('diagrams/jwt-railroad-diagram.svg', file[3].name);
});