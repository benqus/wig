/**
 *
 * @param   {object} obj
 * @returns {*}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (o) {
        if (o) {
            Object.keys(o).forEach(function (key) {
                obj[key] = o[key];
            });
        }
    });

    return obj;
}
