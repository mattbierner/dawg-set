/**
 * 
 */
"use strict";

const slice = Array.prototype.slice;

const createEmptyNode = id => ({
    edges: {},
    final: false,
    id: id
});

const lexicographicalCompare = (a, b) =>
    a.localeCompare(b);

const encode = node => {
    let s = +node.final;
    for (let k of Object.keys(node.edges))
        s += `_${k}_${node.edges[k].id}`;
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
        this._root = createEmptyNode(this._id++);

        this._previous = "";
        this._uncheckedNodes = []
        this._minimizedNodes = new Map();

        if (paths)
            for (let p of paths)
                this.add(p);
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
            throw "Dawg finalized, cannot insert new entries";

        const order = this._options.compare(path, this._previous);
        if (order < 0)
            throw "Paths must be inserted in lexograpic order";
        if (order === 0)
            return this;

        let commonPrefix = 0;
        for (; commonPrefix < path.length && commonPrefix < this._previous.length; ++commonPrefix)
            if (path[commonPrefix] !== this._previous[commonPrefix])
                break

        this._minimize(commonPrefix)

        let node = this._uncheckedNodes.length === 0 ? this._root : this._uncheckedNodes[this._uncheckedNodes.length - 1][2];

        for (let letter of slice.call(path, commonPrefix)) {
            let nextNode = createEmptyNode(this._id++);
            node.edges[letter] = nextNode;
            this._uncheckedNodes.push([node, letter, nextNode]);
            node = nextNode;
        }

        node.final = true;
        this._previous = path;
        ++this._count;
        return this;
    }

    /**
     * Does an entry for `path` exists in the DAWG?
     */
    has(path) {
        let node = this._root;
        for (let x of path) {
            node = node.edges[x];
            if (!node)
                return false;
        }
        return node.final;
    }

    /**
     * Get the number of entries in the DAWG.
     */
    count() {
        return this._count;
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

    _minimize(downTo) {
        for (let i = 0, len = this._uncheckedNodes.length - downTo; i < len; ++i) {
            const [parent, letter, child] = this._uncheckedNodes.pop();
            const key = encode(child);
            const existing = this._minimizedNodes.get(key);
            if (existing) {
                parent.edges[letter] = existing;
            } else {
                this._minimizedNodes.set(key, child);
            }
        }
    }
}

/**
 * Create a finalized DAWG from an iterable.
 * 
 * @see new Dawg()
 */
export const from = Dawg.from = (paths, options) =>
    new Dawg(paths, options).finalize();
