"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('count', () => {
    it('Empty DAWG should match nothing no entries', () => {
        assert.deepEqual([], Dawg.from([]).match('a'));
        assert.deepEqual([], Dawg.from([]).match(''));
    });
    
    it('should match longest final entry', () => {
        assert.deepEqual([], Dawg.from(['abc', 'abcd', 'abcdef']).match('abcdex'));
        assert.deepEqual([], Dawg.from([]).match(''));
    });
});

