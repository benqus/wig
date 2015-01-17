var arrayIndexOf = Array.prototype.indexOf;

var
    /**
     * ID
     * @static
     * @private
     * @type {number}
     */
    Id = 0,

    /**
     * noop
     * @static
     * @function
     */
    NoOp = function () {},

    /**
     * Data attribute wig attaches the View#_ID to.
     * @static
     * @constant
     * @type {string}
     */
    DATA_ATTRIBUTE = 'wig_view_id';

wig.DATA_ATTRIBUTE = DATA_ATTRIBUTE;

// TODO: improved templating with caching - maybe?