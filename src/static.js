var
    /**
     * View ID
     * @static
     * @private
     * @type {number}
     */
    Id = 0,

    /**
     * noop
     * @function
     */
    NoOp = function () {},

    /**
     * Map of registered Views
     * @type {object}
     */
    ViewRegistry = {},

    /**
     * Data attribute wig attaches the View#_ID to.
     * @type {string}
     */
    DATA_ATTRIBUTE = 'wig_view_id';



// TODO: Events

// TODO: memorize previous attributes when views update (recursively!!!)
