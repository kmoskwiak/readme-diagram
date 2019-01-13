const fs = require('fs');
const path = require('path');
const marked = require('marked');
const os = require('os');
const sequence = require('./node_modules/diagrams/src/sequence/sequence');
const dot = require('./node_modules/diagrams/src/dot/dot');
const flowchart = require('./node_modules/diagrams/src/flowchart/flowchart');
const railroad = require('./node_modules/diagrams/src/railroad/railroad');

class Parser {
    constructor(filePath) {
        this.filePath = path.resolve(__dirname, filePath);
        this.parsedFile = null;

        this.diagramCodes = [
            { 
                name: 'js-sequence-diagram',
                processor: sequence
            },
            { 
                name: 'js-dot-diagram',
                processor: dot
            },
            { 
                name: 'js-flowchart-diagram',
                processor: flowchart
            },
            { 
                name: 'js-railroad-diagram',
                processor: railroad
            }
        ];
    }

    findImage(text) {
        const re = /!\[[^\[^\]]*\]\(([^\)^\(]*)\)/gm;
        let arr;
        let image;
        while ((arr = re.exec(text)) !== null) {
            image = arr;
        }
        return image;
    }

    selectDiagram(name) {
        for(let i in this.diagramCodes) {
            if(this.diagramCodes[i].name === name) {
                return this.diagramCodes[i].processor;
            }
        }
        return null;
    }

    generateDiagram(diagramGenerator, codeFile, imagePath) {
        return new Promise((resolve, reject) => {
            diagramGenerator(codeFile, imagePath, (err) => {
                if(err) {
                    return reject(err);
                }

                return resolve(imagePath);
            });
        });
    }

    async processFile() {
        let fileData = await this.readFile(this.filePath);
        let fileDir = path.dirname(this.filePath);
        this.parsedFile = marked.lexer(fileData);

        let files = [];

        for(let i in this.parsedFile) {

            if(this.parsedFile[i].type 
                && this.parsedFile[i].type === 'code' 
                && this.parsedFile[i].lang 
                && this.selectDiagram(this.parsedFile[i].lang)) {
                
                let code = this.parsedFile[i].text;
                let image;
                for(let k = i; k > 0; k--){
                    if(this.parsedFile[k].text) {
                        image = this.findImage(this.parsedFile[k].text);
                        if(image) { break; }
                    }
                }
                let stamp = Date.now().toString(36);
                let codeFile = path.resolve(os.tmpdir(), 'diagram-' + stamp + '.txt');
                fs.appendFileSync(codeFile, code);
                let imagePath = path.resolve(fileDir, image[1]);
                let diagramGenerator = this.selectDiagram(this.parsedFile[i].lang);

                let file = {
                    name: image[1],
                    path: imagePath,
                    generator: this.parsedFile[i].lang
                };
                
                try {
                    this.generateDiagram(diagramGenerator, codeFile, imagePath);
                    files.push(file);
                } catch(err) {
                    console.error(err);
                }
            }
        }
        return files;
    }

    readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, { encoding: 'utf8'}, (err, data) => {
                if(err) {
                    return reject(err);
                }

                return resolve(data);
            });
        });
    }
}

module.exports = Parser;