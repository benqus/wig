var Insurer = wig.Insurer = wig.Class.extend({

    is: {
        notDefined: function (arg, message) {
            if (typeof arg === 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is not defined!');
            }
        },
        defined: function (arg, message) {
            if (typeof arg !== 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is defined (not null and not undefined)!');
            }
        }
    },

    exists: {
        object: function (arg, message) {
            if (arg == null || typeof arg !== 'object') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        }
    }
});