/**
 * Merges all argument objects into the first one.
 * @param   {object} obj
 * @returns {object}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1),
        argsLength = args.length,
        key,
        i;

    for (i = 0; i < argsLength; i += 1) {
        if (args[i] && typeof args[i] === 'object') {
            for (key in args[i]) {
                obj[key] = args[i][key];
            }
        }
    }

    return obj;
}

wig.extend = extend;