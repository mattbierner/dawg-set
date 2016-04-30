"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('values', () => {
    it('Empty dag should have no values', () => {
        assert.deepEqual([], Array.from(Dawg.from([]).values()));
        assert.deepEqual([], Array.from(new Dawg().values()));
    });

    it('Single dag should have one value', () => {
        assert.deepEqual(['a'], Array.from(Dawg.from(['a']).values()));
    });
    it('Single dag should have one value', () => {
        assert.deepEqual(['a', 'b', 'c'], Array.from(Dawg.from(['a', 'b', 'c']).values()));
        assert.deepEqual(['a', 'ab', 'b', 'ba', 'bace', 'c'], Array.from(Dawg.from(['a', 'ab', 'b', 'ba', 'bace', 'c']).values()));
    });
});

