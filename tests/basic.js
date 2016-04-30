"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('count', () => {
    it('Empty DAWG should have no entries', () => {
        assert.strictEqual(0, Dawg.from([]).count());
        assert.strictEqual(0, Dawg.from().count());
        assert.strictEqual(0, new Dawg().count());
        
        assert.strictEqual(false, new Dawg().has('a'));

    });

    it('Insert empty is noop', () => {
        assert.strictEqual(0, new Dawg().add('').count());
        assert.strictEqual(0, new Dawg().add([]).count());
    });

    it('Single insert should have single entry', () => {
        const d = new Dawg().add('a');
        assert.strictEqual(true, d.has('a'));
        assert.strictEqual(1, d.count());

        const d2 = new Dawg().add('abc');
        assert.strictEqual(true, d2.has('abc'));
        assert.strictEqual(1, d2.count());
    });

    it('Single insert of array key should have single entry', () => {
        const d = new Dawg();
        d.add(['abc']);
        assert.strictEqual(true, d.has(['abc']));
        assert.strictEqual(1, d.count());

        const d2 = new Dawg();
        d2.add(['ab', 'c']);
        assert.strictEqual(true, d2.has(['ab', 'c']));
        assert.strictEqual(1, d2.count());
    });

    it('Multi insert should insert all entries', () => {
        const words = [];
        for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); ++i)
            words.push(String.fromCharCode(i));

        const d = Dawg.from(words);
        words.forEach(x => {
            assert.strictEqual(true, d.has(x));
        });

        assert.strictEqual(words.length, d.count());
    });

    it('Multi insert with prefix/suffix should insert all entries', () => {
        const words = [];
        let prefix = '';
        let suffix = '';
        for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); ++i) {
            const char = String.fromCharCode(i);
            prefix = prefix + char;
            suffix = char + suffix;
            words.push(prefix);
            if (prefix != suffix)
                words.push(suffix);
        }
        words.sort();

        const d = Dawg.from(words);

        words.forEach(x => {
            assert.strictEqual(true, d.has(x));
        });

        assert.strictEqual(words.length, d.count());
    });
    
     it('Multi insert with prefix/suffix should insert all entries', () => {
        const words = [];
        let prefix = [];
        let suffix = [];
        for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); ++i) {
            const char = String.fromCharCode(i);
            prefix = prefix.concat(char);
            suffix = [char].concat(suffix);
            words.push(prefix);
            if (suffix.length > 1)
                words.push(suffix);
        }
        words.sort();

        const d = Dawg.from(words);

        words.forEach(x => {
            assert.strictEqual(true, d.has(x));
        });

        assert.strictEqual(words.length, d.count());
    });

    it('aa', () => {
        const d = Dawg.from(['ab', 'ba']);
        assert.strictEqual(true, d.has('ab'));
        assert.strictEqual(true, d.has('ba'));

        assert.strictEqual(2, d.count());
    });

    it('aa', () => {
        const d = Dawg.from(['abcd', 'bcd']);
        assert.strictEqual(true, d.has('abcd'));
        assert.strictEqual(true, d.has('bcd'));

        assert.strictEqual(2, d.count());
    });
});

