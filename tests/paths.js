"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('paths', () => {
    it('Empty DAWG should have no paths', () => {
        assert.deepEqual([], Array.from(Dawg.from([]).paths()));
        assert.deepEqual([], Array.from(new Dawg().paths()));
    });

    it('Single DAWG should have one value', () => {
        assert.deepEqual([['a']], Array.from(Dawg.from(['a']).paths()));
        assert.deepEqual([['a', 'bc']], Array.from(Dawg.from([['a', 'bc']]).paths()));

    });

    it('Single DAWG should have one path', () => {
        assert.deepEqual(
            [['a'], ['b'], ['c']],
            Array.from(Dawg.from(['a', 'b', 'c']).paths()));

        assert.deepEqual(
            [['a'], ['a', 'b'], ['b'], ['b', 'a'], ['b', 'a', 'a'], ['b', 'a', 'c', 'e'], ['c']],
            Array.from(Dawg.from(['a', 'ab', 'b', 'ba', 'baa', 'bace', 'c']).paths()));
    });

    it('should handle word level dwags', () => {
        const d = Dawg.from([
            ['bull', 'dog'],
            ['bull', 'terrier']]);

        assert.deepEqual([
            ['bull', 'dog'],
            ['bull', 'terrier']],
            Array.from(d.paths()));
    });
});

