/**
 * 
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var slice = Array.prototype.slice;

var createEmptyNode = function createEmptyNode(id) {
    return {
        edges: {},
        final: false,
        id: id
    };
};

var lexicographicalCompare = function lexicographicalCompare(a, b) {
    return a.localeCompare(b);
};

var encode = function encode(node) {
    var s = +node.final;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(node.edges)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var k = _step.value;

            s += "_" + k + "_" + node.edges[k].id;
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
        this._root = createEmptyNode(this._id++);

        this._previous = "";
        this._uncheckedNodes = [];
        this._minimizedNodes = new Map();

        if (paths) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _p = _step2.value;

                    this.add(_p);
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
        }
    }

    /**
     * Add an entry to the DAWG.
     * 
     * Entries must be added in lexographic order and cannot be added after
     * the DAWG is marked as finalized.
     * 
     * @param path Path components to add.
     */


    _createClass(Dawg, [{
        key: "add",
        value: function add(path) {
            if (this._finalized) throw "Dawg finalized, cannot insert new entries";

            var order = this._options.compare(path, this._previous);
            if (order < 0) throw "Paths must be inserted in lexograpic order";
            if (order === 0) return this;

            var commonPrefix = 0;
            for (; commonPrefix < path.length && commonPrefix < this._previous.length; ++commonPrefix) {
                if (path[commonPrefix] !== this._previous[commonPrefix]) break;
            }this._minimize(commonPrefix);

            var node = this._uncheckedNodes.length === 0 ? this._root : this._uncheckedNodes[this._uncheckedNodes.length - 1][2];

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = slice.call(path, commonPrefix)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var letter = _step3.value;

                    var nextNode = createEmptyNode(this._id++);
                    node.edges[letter] = nextNode;
                    this._uncheckedNodes.push([node, letter, nextNode]);
                    node = nextNode;
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

            node.final = true;
            this._previous = path;
            ++this._count;
            return this;
        }

        /**
         * Does an entry for `path` exists in the DAWG?
         */

    }, {
        key: "has",
        value: function has(path) {
            var node = this._root;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = path[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var x = _step4.value;

                    node = node.edges[x];
                    if (!node) return false;
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

            return node.final;
        }

        /**
         * Get the number of entries in the DAWG.
         */

    }, {
        key: "count",
        value: function count() {
            return this._count;
        }

        /**
         * Mark the current DAWG as complete.
         * 
         * Prevents further modifications.
         */

    }, {
        key: "finalize",
        value: function finalize() {
            if (!this._finalized) {
                this._minimize(0);
                this._minimizedNodes = null;
                this._uncheckedNodes = null;
                this._finalized = true;
            }
            return this;
        }
    }, {
        key: "_minimize",
        value: function _minimize(downTo) {
            for (var i = 0, len = this._uncheckedNodes.length - downTo; i < len; ++i) {
                var _uncheckedNodes$pop = this._uncheckedNodes.pop();

                var _uncheckedNodes$pop2 = _slicedToArray(_uncheckedNodes$pop, 3);

                var parent = _uncheckedNodes$pop2[0];
                var letter = _uncheckedNodes$pop2[1];
                var child = _uncheckedNodes$pop2[2];

                var key = encode(child);
                var existing = this._minimizedNodes.get(key);
                if (existing) {
                    parent.edges[letter] = existing;
                } else {
                    this._minimizedNodes.set(key, child);
                }
            }
        }
    }]);

    return Dawg;
}();

/**
 * Create a finalized DAWG from an iterable.
 * 
 * @see new Dawg()
 */


exports.default = Dawg;
var from = exports.from = Dawg.from = function (paths, options) {
    return new Dawg(paths, options).finalize();
};
//# sourceMappingURL=dawg.js.map