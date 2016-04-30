/**
 * Directed Acyclic Word Graph (DAWG)
 * 
 * Based on https://gist.github.com/smhanov/94230b422c2100ae4218
 */
"use strict";

const slice = Array.prototype.slice;

const concat = (a, b) => a.concat(b);

const join = (joiner) =>
    typeof joiner === 'function'
        ? joiner
        : (acc, current) => (acc === null ? '' : acc + joiner) + current;

/* Traversal
 ******************************************************************************/
const DONE = { done: true };

const Iterator = function (root, initial, join) {
    // Linked list stack of nodes to visit.
    this.stack = root && { node: root, value: initial, rest: null };
    this.join = join;
};

Iterator.prototype.next = function () {
    while (this.stack) {
        const head = this.stack;
        // Replace head of stack with visits to child edges of head node, then
        // remove head.
        let r = head;
        for (let [edge, value] of head.node.edges)
            r = r.rest = ({ node: value, value: this.join(head.value, edge), rest: r.rest });
        this.stack = this.stack.rest;

        if (head.node.final)
            return head;
    }
    return DONE;
};

Iterator.prototype[Symbol.iterator] = function () {
    return this;
};

/* Dawg
 ******************************************************************************/
const lexicographicalCompare = (a, b) =>
    a.localeCompare(b);

const encode = node => {
    let s = +node.final;
    for (let [k, v] of node.edges)
        s += `_${k}_${v.id}`;
    return s;
};

const DEFAULT_OPTIONS = {
    compare(a, b) {
        if (typeof a === 'string')
            return lexicographicalCompare(a, b);

        const lenA = a.length;
        const lenB = b.length;
        for (let i = 0; i < lenA && i < lenB; ++i) {
            const r = lexicographicalCompare(a[i], b[i]);
            if (r !== 0)
                return r;
        }
        return lenA - lenB;
    }
};

/**
 * 
 */
export default class Dawg {
    /**
     * @param paths Optional iterable of paths to insert into the new DAWG.
     */
    constructor(paths, options) {
        this._options = Object.assign({}, options, DEFAULT_OPTIONS);

        this._count = 0;
        this._id = 0;
        this._root = this._newNode();

        this._previous = "";
        this._uncheckedNodes = []
        this._minimizedNodes = {};

        if (paths)
            for (let p of paths)
                this.add(p);
    }

    /**
      * Get the number of entries in the DAWG.
      */
    count() {
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
    add(path) {
        if (this._finalized)
            throw new Error("Dawg finalized, cannot insert new entries");

        const order = this._options.compare(path, this._previous);
        if (order < 0)
            throw new Error("Paths must be inserted in lexograpic order");
        if (order === 0)
            return this;

        let commonPrefix = 0;
        for (; commonPrefix < path.length && commonPrefix < this._previous.length; ++commonPrefix)
            if (path[commonPrefix] !== this._previous[commonPrefix])
                break

        this._minimize(commonPrefix)

        let node = this._uncheckedNodes.length === 0 ? this._root : this._uncheckedNodes[this._uncheckedNodes.length - 1][2];

        for (let letter of slice.call(path, commonPrefix)) {
            let nextNode = this._newNode();
            node.edges.set(letter, nextNode);
            this._uncheckedNodes.push([node, letter, nextNode]);
            node = nextNode;
        }

        node.final = true;
        this._previous = path;
        ++this._count;
        return this;
    }

    _findNode(path) {
        let node = this._root;
        let i = 0;
        for (let x of path) {
            if (!node)
                return [null, 0];
            node = node.edges.get(x);
            ++i;
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
    longest(path) {
        let best = 0;
        let node = this._root;
        if (node) {
            let i = 0;
            for (let x of path) {
                node = node.edges.get(x);
                if (!node)
                    break;
                ++i;
                if (node.final)
                    best = i;
            }
        }
        return best;
    }

    /**
     * Does an exact entry for `path` exists in the DAWG?
     */
    has(path) {
        return (this.longest(path) === path.length);
    }

    /**
     * Return the path for the longest match in the dawg.
     * 
     * @see longest
     */
    match(path) {
        return slice.call(path, 0, this.longest(path)).join('');
    }

    /**
     * Mark the current DAWG as complete.
     * 
     * Prevents further modifications.
     */
    finalize() {
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
    paths() {
        return new Iterator(this._root, [], concat);
    }

    /**
     * Get an iterator to all values in the dawg.
     * 
     * @param joiner String or function used to join paths together into strings.
     */
    values(joiner = '') {
        return new Iterator(this._root, null, join(joiner));
    }

    /**
     * Get an iterator to all values starting with `path` in the dawg.
     * 
     * @see values
     */
    valuesStartingWith(path, joiner = '') {
        const [root, index] = this._findNode(path);
        const joinFn = join(joiner);
        return new Iterator(root, slice.call(path, 0, index).reduce(joinFn, null), joinFn);
    }

    _newNode() {
        return {
            edges: new Map(),
            final: false,
            id: this._id++
        };
    }

    _minimize(downTo) {
        for (let i = 0, len = this._uncheckedNodes.length - downTo; i < len; ++i) {
            const [parent, letter, child] = this._uncheckedNodes.pop();
            const key = encode(child);
            const existing = this._minimizedNodes[key];
            if (existing) {
                parent.edges.set(letter, existing);
            } else {
                this._minimizedNodes[key] = child;
            }
        }
    }
}

Dawg.prototype[Symbol.iterator] = Dawg.prototype.values;

/**
 * Create a finalized DAWG from an iterable.
 * 
 * @see new Dawg()
 */
export const from = Dawg.from = (paths, options) =>
    new Dawg(paths, options).finalize();
