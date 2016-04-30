"use strict";
const Dawg = require('../dawg').default;
const assert = require('chai').assert;

describe('values', () => {
    it('Empty DAWG should have no values', () => {
        assert.deepEqual([], Array.from(Dawg.from([]).values()));
        assert.deepEqual([], Array.from(new Dawg().values()));

        assert.deepEqual([], Array.from(new Dawg()));
        assert.deepEqual([], Array.from(Dawg.from()));
    });

    it('Single DAWG should have one value', () => {
        assert.deepEqual(['a'], Array.from(Dawg.from(['a']).values()));
        assert.deepEqual(['a'], Array.from(Dawg.from(['a']).values('x')));

        assert.deepEqual(['a'], Array.from(Dawg.from(['a'])));
    });

    it('should join on path values using joiner', () => {
        assert.deepEqual(
            ['axbxc', 'bxcxa', 'cxaxb'],
            Array.from(Dawg.from(['abc', 'bca', 'cab']).values('x')));

        assert.deepEqual(
            ['axbxc', 'bcxa', 'cab'],
            Array.from(Dawg.from(['abc', ['bc', 'a'], ['cab']]).values('x')));
    });

    it('should accept a custom join function', () => {
        const d = Dawg.from(['abc', 'bca', 'cab']);
        assert.deepEqual(
            ['aabbcc', 'bbccaa', 'ccaabb'],
            Array.from(d.values((acc, x) => (acc ? acc + x : x) + x)));
    });

    it('should handle word level dwags', () => {
        const d = Dawg.from([
            ['bull', 'dog'],
            ['bull', 'terrier']]);
            
        assert.deepEqual(
            ['bull|dog', 'bull|terrier'],
            Array.from(d.values('|')));
    });
});

