/**
 * @classdesc Provides a convenient API for a key-value pair store.
 * @class
 */
var Registry = wig.Registry = Class.extend({

    constructor: function () {
        this.root = {};
    },

    /**
     * Returns the stored value for the specified key.
     * Returns  {undefined} if key doesn't exist.
     * @param   {string} key
     * @returns {*}
     */
    get: function (key) {
        return this.root[key];
    },

    /**
     * Registers a value for the specified key.
     * @param {string} key
     * @param {*}      value
     */
    set: function (key, value) {
        this.root[key] = value;
    },

    /**
     * Removes the value specified by the key.
     * @param {string} key
     */
    unset: function (key) {
        delete this.root[key];
    },

    /**
     * Iterates over each item in the registry and executes the provided callback for each value and key.
     * @param  {function}         callback
     * @param  {object|undefined} thisArg
     * @throws {TypeError}
     */
    each: function (callback, thisArg) {
        var key, value;
        if (typeof callback === 'function') {
            for (key in this.root) {
                value = this.get(key);
                callback.call(thisArg || this, key, value);
            }
        }
    },

    /**
     * This is an internal method, don't use it!
     * Empties the registry.
     */
    empty: function () {
        Object.keys(this.root).forEach(this.unset, this);
    }
});