'use strict';
const fs = require('fs')
const readline = require('readline');
const Dawg = require('./dawg').default;
const assert = require('assert');

const build = (file, k) => {
    const lineReader = readline.createInterface({
        input: fs.createReadStream(file)
    });

    let words = []
    lineReader.on('line', line => {
        words.push(line.toLowerCase());
    })
        .on('close', () => {
            words.sort()
            const dawg = Dawg.from(words);
            
            words.forEach(x => {
                assert.ok(dawg.has(x), x);
            });
            console.log(dawg.count())
            k(dawg);
        });
};



var DICTIONARY = "/usr/share/dict/words"

build(DICTIONARY, (data) => {
    console.log(data.has('aa'))
    console.log(data.has('abave'));
   // fs.writeFileSync('out.json', JSON.stringify(data, null, 4));
});
