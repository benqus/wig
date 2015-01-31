var Insurer = wig.Insurer = wig.Class.extend({

    is: {

        defined: function (arg, message) {
            if (typeof arg !== 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is defined (not null and not undefined)!');
            }
        },

        object: function (arg, message) {
            if (arg && typeof arg !== 'object') {
                throw new TypeError(message || 'Argument should be a function or undefined!');
            }
        },

        callable: function (arg, message) {
            if (arg && typeof arg !== 'function') {
                throw new TypeError(message || 'Argument should be a function or undefined!');
            }
        },

        number: function (arg, message) {
            if (arg !== 0 && arg && typeof arg !== 'number') {
                throw new TypeError(message || 'Argument should be a string or undefined!');
            }
        },

        string: function (arg, message) {
            if (arg !== '' && arg && typeof arg !== 'string') {
                throw new TypeError(message || 'Argument should be a string or undefined!');
            }
        }

    },

    exists: {

        object: function (arg, message) {
            if (arg == null || typeof arg !== 'object') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        },

        callable: function (arg, message) {
            if (arg == null || typeof arg !== 'function') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        },

        number: function (arg, message) {
            if (arg == null || typeof arg !== 'number') {
                throw new TypeError(message || 'Argument must be a string!');
            }
        },

        string: function (arg, message) {
            if (arg == null || typeof arg !== 'string') {
                throw new TypeError(message || 'Argument must be a string!');
            }
        }

    }

});