"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('valuesStartingWith', () => {
    it('Empty DAWG should have no valuesStartingWith', () => {
        assert.deepEqual([], Array.from(Dawg.from([]).valuesStartingWith('')));
        assert.deepEqual([], Array.from(Dawg.from([]).valuesStartingWith('fads')));
    });

    it('Single DAWG should have one value', () => {
        const d = Dawg.from(['a']);
        assert.deepEqual(['a'], Array.from(d.valuesStartingWith('a')));
        assert.deepEqual([], Array.from(d.valuesStartingWith('abc')));
        assert.deepEqual([], Array.from(d.valuesStartingWith('x')));
    });

    it('should return all starting values', () => {
        const d = Dawg.from(['a', 'abc', 'abcd', 'd', 'da']);
        assert.deepEqual(
            ['abc', 'abcd'],
            Array.from(d.valuesStartingWith('ab')));

        assert.deepEqual(
            [],
            Array.from(d.valuesStartingWith('abcde')));

        assert.deepEqual(
            ['da'],
            Array.from(d.valuesStartingWith('da')));
    });
    
    it('should join components using custom string ', () => {
        const d = Dawg.from(['a', 'abc', 'abcd', 'd', 'da']);
        assert.deepEqual(
            ['axbxc', 'axbxcxd'],
            Array.from(d.valuesStartingWith('ab', 'x')));
    });

    
     it('should join components using custom function ', () => {
        const d = Dawg.from(['a', 'abc', 'abcd', 'd', 'da']);
        const joiner = (acc, x) => (acc ? acc + x : x) + x;
        assert.deepEqual(
            ['aabbcc', 'aabbccdd'],
            Array.from(d.valuesStartingWith('ab', joiner)));
    });
});

