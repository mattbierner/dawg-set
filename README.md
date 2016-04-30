# Dawg-Set

Javascript [directed acyclic word graph (DAWG)][dawg] library. DAWGs allow efficient storage of large sets of strings by compressing the storage graph.

```sh
$ npm install dawg-set --save
```

```js
import Dawg from 'dawg-set';
```

## Documentation
A DAWG stores a set of strings of letters in a graph, reusing nodes where possible. Dawg-set can be used to store regular strings where each node in the graph is a single character or, more generally, "strings" where each component of the string is another string. The latter approach is useful because it allows you to store sentences in the DAWG at a word level, instead of storing them as individual characters.

When constructing the DAWG, you must insert items in [lexicographic order][lex]. For simple strings, this is just dictionary order. You can `.sort()` a Javascript array to put it in lexicographic order if you are not sure. 

#### `new Dawg(stringIterator, options)`
Top level DAWG class.

* `stringIterator` - Optional iterator of strings used to populate initial set. Strings must be in [lexicographic order][lex].
* `options` - Optional object specifying behavior of the data structure. Must defined a single member, `compare` which, performs a lexicographic comparison of two strings.

```js
const empty_dawg = new Dawg();

const basic_char_dawg = new Dawg(['poodle', 'puli', 'pug']);

const basic_string_dawg = new Dawg([
    ['bull', 'dog'],
    ['bull', 'terrier']]);
```

#### `Dawg.from(stringIterator, options)`
Same as `new Dawg(stringIterator, options)`, but freezes the dawg before returning. See `Dawg.prototype.freeze`

#### `Dawg.prototype.count()`
Get the number of entries stored in the DAWG. DAWGs cannot contain duplicate entires.

```js
Dawg.from([]).count() === 0

Dawg.from(['poodle', 'puli', 'pug']).count() === 3

new Dawg([
    ['bull', 'dog'],
    ['bull', 'terrier']]
).count() === 2
```

#### `Dawg.prototype.add(string)`
Add a string to the DAWG. Returns the DAWG.

`add` must be called in lexicographic order. If you fail to do so, an error is thrown. You cannot update a frozen DAWG.

```js
const d = new Dawg()
d.add('collie').add('corgi')

d.count() === 2
d.has('collie') === true
d.has('lab') === false
d.has('co') === false

d.add('lab')
d.count() === 3
d.has('lab') === true

// Trying to insert the same key again has no effect
d.add('lab')
d.count() === 3

// Trying to insert out of order throws an error
d.add('afghan hound') === throws since 'Afghan Hound' comes before 'lab'

// Trying to add to a frozen DAWG throws an error
const set = Dawg.from([])
set.add('collie') === throws since `set` is frozen by `from`.
```

#### `Dawg.prototype.freeze()`
Locks the DAWG and prevents further mutation. Once you are done mutating the DAWG, freezing it can free up some memory.

`Dawg.from` automatically freezes its result.

```js
const d = new Dawg()
d.add('collie').add('corgi').freeze()

d.count() === 2
d.has('collie') === true

d.add('lab') === throws since graph is frozen now
```

#### `Dawg.prototype.has(string)`
Does the set contain an entry for `string`?

```js
const d = Dawg.from(['poodle', 'puli', 'pug']);

d.has('puli') === true
d.has('mastiff') === false

// Storage is sensitive
d.has('PULI') === false
```

#### `Dawg.prototype.match(string)`
Finds the longest string in the DAWG that is part of `string`. The result will be between 0 `string.length` long. Only matches complete words in the DAWG.

```js
const d = Dawg.from(['a', 'abc', 'abcde']);

d.match('a') === 'a'
d.match('x') === ''
d.match('abx') === 'a'
d.match('abcd') === 'abc'
d.match('abcdx') === 'abc'
d.match('abcdefg') === 'abcde'
```

#### `Dawg.prototype.longest(string)`
Same behavior as `match`, but returns the length of the longest match instead of the match itself.

One use of this is to get the matched vs unmatched parts of the input string:

```js
const d = Dawg.from(['a', 'abc', 'abcde'])

const path = 'abcdx'
const i = d.longest(path)
const matched = path.slice(0, i)
const unmatched = path.slice(i)

matched === 'abc'
unmatched === 'dx'
```

#### `Dawg.prototype.values(joiner = '')` `Dawg.prototype[Symbol.iterator]`
Get an iterator to all strings in the dawg.

- `joiner` - Optional. String or function used to join the letters of the strings together. If a string, this is inserted between each letter. If this is a function, it is invoked with the left and right parts of the string to join and must return a string. 

```js
const d = Dawg.from(['a', 'abc', 'abcde'])

Array.from(d.values()) === Array.from(d) === ['a', 'abc', 'abcde']

// Using a custom joiner
Array.from(d.values('|')) === ['a', 'a|b|c', 'a|b|c|d|e']

// Using with word level DAWG
const wd = Dawg.from([
    ['bull', 'dog'],
    ['bull', 'terrier']]);

Array.from(wd.values()) === Array.from(wd) === ['bulldog', 'bullterrier']

Array.from(wd.values(' ')) === ['bull dog', 'bull terrier']
```

#### `Dawg.prototype.paths()`
Get an iterator to all letter paths in the dawg.

Unlike `values()`, this returns arrays of characters.

```js
const d = Dawg.from(['a', 'abc', 'abcde'])

Array.from(d.paths()) === [['a'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e']]

// Using with word level DAWG
const wd = Dawg.from([
    ['bull', 'dog'],
    ['bull', 'terrier']]);

Array.from(wd.paths()) === [['bull', 'dog'], ['bull', 'terrier']];
```

#### `Dawg.prototype.valuesStartingWith(string, joiner = '')`
Same basic behavior as `values()` but only returns values that start with `string`. `string` itself does not have to be in the set.

```js
const d = Dawg.from(['a', 'abc', 'abcde', 'abe', 'd'])

Array.from(d.valuesStartingWith('abc')) ===  ['abc', 'abcde']
```

## Credits
Implementation based on https://gist.github.com/smhanov/94230b422c2100ae4218


[dawg]: https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton

[lex]: https://en.wikipedia.org/wiki/Lexicographical_order