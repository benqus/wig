/**
 * Updates the View#attributes by a key and a value or a map of key/value pairs.
 * @param {string|object} arg
 * @param {*}             value
 * @param {object}        attributes
 */
function setViewAttribute(arg, value, attributes) {
    if (typeof arg === 'object') {
        Object.keys(arg).forEach(function (key) {
            setViewAttribute(key, arg[key], attributes);
        });
    } else {
        attributes[arg] = value;
    }
}