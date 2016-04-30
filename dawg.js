/**
 * Directed Acyclic Word Graph (DAWG)
 * 
 * Based on https://gist.github.com/smhanov/94230b422c2100ae4218
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var slice = Array.prototype.slice;

var concat = function concat(a, b) {
    return a.concat(b);
};

var join = function join(joiner) {
    return typeof joiner === 'function' ? joiner : function (acc, current) {
        return (acc === null ? '' : acc + joiner) + current;
    };
};

/* Traversal
 ******************************************************************************/
var DONE = { done: true };

var Iterator = function Iterator(root, initial, join) {
    // Linked list stack of nodes to visit.
    this.stack = root && { node: root, value: initial, rest: null };
    this.join = join;
};

Iterator.prototype.next = function () {
    while (this.stack) {
        var head = this.stack;
        // Replace head of stack with visits to child edges of head node, then
        // remove head.
        var r = head;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = head.node.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2);

                var edge = _step$value[0];
                var value = _step$value[1];

                r = r.rest = { node: value, value: this.join(head.value, edge), rest: r.rest };
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        this.stack = this.stack.rest;

        if (head.node.final) return head;
    }
    return DONE;
};

Iterator.prototype[Symbol.iterator] = function () {
    return this;
};

/* Dawg
 ******************************************************************************/
var lexicographicalCompare = function lexicographicalCompare(a, b) {
    return a.localeCompare(b);
};

var encode = function encode(node) {
    var s = +node.final;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = node.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = _slicedToArray(_step2.value, 2);

            var k = _step2$value[0];
            var v = _step2$value[1];

            s += '_' + k + '_' + v.id;
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return s;
};

var DEFAULT_OPTIONS = {
    compare: function compare(a, b) {
        if (typeof a === 'string') return lexicographicalCompare(a, b);

        var lenA = a.length;
        var lenB = b.length;
        for (var i = 0; i < lenA && i < lenB; ++i) {
            var r = lexicographicalCompare(a[i], b[i]);
            if (r !== 0) return r;
        }
        return lenA - lenB;
    }
};

/**
 * 
 */

var Dawg = function () {
    /**
     * @param paths Optional iterable of paths to insert into the new DAWG.
     */

    function Dawg(paths, options) {
        _classCallCheck(this, Dawg);

        this._options = Object.assign({}, options, DEFAULT_OPTIONS);

        this._count = 0;
        this._id = 0;
        this._root = this._newNode();

        this._previous = "";
        this._uncheckedNodes = [];
        this._minimizedNodes = {};

        if (paths) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = paths[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _p = _step3.value;

                    this.add(_p);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }

    /**
      * Get the number of entries in the DAWG.
      */


    _createClass(Dawg, [{
        key: 'count',
        value: function count() {
            return this._count;
        }

        /**
         * Add an entry to the DAWG.
         * 
         * Entries must be added in lexographic order and cannot be added after
         * the DAWG is marked as finalized.
         * 
         * @param path Path components to add.
         */

    }, {
        key: 'add',
        value: function add(path) {
            if (this._finalized) throw new Error("Dawg finalized, cannot insert new entries");

            var order = this._options.compare(path, this._previous);
            if (order < 0) throw new Error("Paths must be inserted in lexograpic order");
            if (order === 0) return this;

            var commonPrefix = 0;
            for (; commonPrefix < path.length && commonPrefix < this._previous.length; ++commonPrefix) {
                if (path[commonPrefix] !== this._previous[commonPrefix]) break;
            }this._minimize(commonPrefix);

            var node = this._uncheckedNodes.length === 0 ? this._root : this._uncheckedNodes[this._uncheckedNodes.length - 1][2];

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = slice.call(path, commonPrefix)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var letter = _step4.value;

                    var nextNode = this._newNode();
                    node.edges.set(letter, nextNode);
                    this._uncheckedNodes.push([node, letter, nextNode]);
                    node = nextNode;
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            node.final = true;
            this._previous = path;
            ++this._count;
            return this;
        }
    }, {
        key: '_findNode',
        value: function _findNode(path) {
            var node = this._root;
            var i = 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = path[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var x = _step5.value;

                    if (!node) return [null, 0];
                    node = node.edges.get(x);
                    ++i;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return [node, i];
        }

        /**
         * Find the length of the longest match for `path` in the dawg.
         *
         * @returns a number in `[0, path.length]` indicating the longest match.
         * 
         * @see match For actually getting the longest match
         */

    }, {
        key: 'longest',
        value: function longest(path) {
            var best = 0;
            var node = this._root;
            if (node) {
                var i = 0;
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = path[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var x = _step6.value;

                        node = node.edges.get(x);
                        if (!node) break;
                        ++i;
                        if (node.final) best = i;
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }
            }
            return best;
        }

        /**
         * Does an exact entry for `path` exists in the DAWG?
         */

    }, {
        key: 'has',
        value: function has(path) {
            return this.longest(path) === path.length;
        }

        /**
         * Return the path for the longest match in the dawg.
         * 
         * @see longest
         */

    }, {
        key: 'match',
        value: function match(path) {
            return slice.call(path, 0, this.longest(path)).join('');
        }

        /**
         * Mark the current DAWG as complete.
         * 
         * Prevents further modifications.
         */

    }, {
        key: 'finalize',
        value: function finalize() {
            if (!this._finalized) {
                this._minimize(0);
                this._minimizedNodes = null;
                this._uncheckedNodes = null;
                this._finalized = true;
            }
            return this;
        }

        /**
         * Get an iterator to all paths in the dawg.
         * 
         * Yields arrays of raw path elements, not joined strings like `values` does.
         */

    }, {
        key: 'paths',
        value: function paths() {
            return new Iterator(this._root, [], concat);
        }

        /**
         * Get an iterator to all values in the dawg.
         * 
         * @param joiner String or function used to join paths together into strings.
         */

    }, {
        key: 'values',
        value: function values() {
            var joiner = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            return new Iterator(this._root, null, join(joiner));
        }

        /**
         * Get an iterator to all values starting with `path` in the dawg.
         * 
         * @see values
         */

    }, {
        key: 'valuesStartingWith',
        value: function valuesStartingWith(path) {
            var joiner = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            var _findNode2 = this._findNode(path);

            var _findNode3 = _slicedToArray(_findNode2, 2);

            var root = _findNode3[0];
            var index = _findNode3[1];

            var joinFn = join(joiner);
            return new Iterator(root, slice.call(path, 0, index).reduce(joinFn, null), joinFn);
        }
    }, {
        key: '_newNode',
        value: function _newNode() {
            return {
                edges: new Map(),
                final: false,
                id: this._id++
            };
        }
    }, {
        key: '_minimize',
        value: function _minimize(downTo) {
            for (var i = 0, len = this._uncheckedNodes.length - downTo; i < len; ++i) {
                var _uncheckedNodes$pop = this._uncheckedNodes.pop();

                var _uncheckedNodes$pop2 = _slicedToArray(_uncheckedNodes$pop, 3);

                var parent = _uncheckedNodes$pop2[0];
                var letter = _uncheckedNodes$pop2[1];
                var child = _uncheckedNodes$pop2[2];

                var key = encode(child);
                var existing = this._minimizedNodes[key];
                if (existing) {
                    parent.edges.set(letter, existing);
                } else {
                    this._minimizedNodes[key] = child;
                }
            }
        }
    }]);

    return Dawg;
}();

exports.default = Dawg;


Dawg.prototype[Symbol.iterator] = Dawg.prototype.values;

/**
 * Create a finalized DAWG from an iterable.
 * 
 * @see new Dawg()
 */
var from = exports.from = Dawg.from = function (paths, options) {
    return new Dawg(paths, options).finalize();
};
//# sourceMappingURL=dawg.js.map
