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

// TODO: preserve focus after re-render on previously focused element ??? (set might have solved this)
// - https://developer.mozilla.org/en-US/docs/Web/API/document.activeElement
// - http://stackoverflow.com/questions/497094/how-do-i-find-out-which-dom-element-has-the-focus

// TODO: improved templating with caching - maybe?