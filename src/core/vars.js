/**
 * ID
 * @static
 * @private
 * @type {number}
 */
var Id = 0;

/**
 * noop
 * @static
 * @function
 */
var NoOp = function () {};

/**
 * Data attribute wig attaches the View#_ID to.
 * @static
 * @constant
 * @type {string}
 */
var DATA_ATTRIBUTE = 'wig_view_id';

var arrayIndexOf = Array.prototype.indexOf;

wig.env = {};
wig.DATA_ATTRIBUTE = DATA_ATTRIBUTE;

// TODO: improved templating with caching - maybe?