/**
 * Merges all argument objects into the first one.
 * @param   {object} obj
 * @returns {object}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (o) {
        if (o && typeof o === 'object') {
            Object.keys(o).forEach(function (key) {
                obj[key] = o[key];
            });
        }
    });

    return obj;
}

wig.extend = extend;