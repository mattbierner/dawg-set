"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('match', () => {
    it('Empty DAWG should match nothing', () => {
        assert.deepEqual('', Dawg.from([]).match('a'));
        assert.deepEqual('', Dawg.from([]).match(''));
        assert.deepEqual('', Dawg.from([]).match([]));
    });
    
    it('should match nothing for value not in DAWG', () => {
        const d = Dawg.from(['a', 'abc', 'bc']);
        assert.deepEqual('', Dawg.from([]).match('ab'));
        assert.deepEqual('', Dawg.from([]).match('x'));
        assert.deepEqual('', Dawg.from([]).match('bx'));
    });
    
    it('should match longest final entry', () => {
        assert.deepEqual('abcd', Dawg.from(['abc', 'abcd', 'abcdef']).match('abcdex'));
    });
});

