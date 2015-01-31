/*
 * Methods that are allowed to be overriden/inherited/extended by user for custom logic.
 */
extend(View.prototype, {

    /**
     * Returns additional, logic based CSS classes for the View's node.
     * @returns {string}
     */
    getCSS: function () {
        return '';
    },

    /**
     * Returns the context to be rendered.
     * @returns {context}
     */
    getContext: function () {
        return this.context;
    },

    /**
     * Method contains logic to parse the new context for the View.
     * @returns {string}
     */
    parseContext: function (newContext) {
        return newContext;
    },

    /**
     * Method contains logic to serialize the View into a context.
     * @returns {string}
     */
    serialize: function () {
        return extend({}, this.defaults, this.context);
    },

    /**
     * Method will be executed after the View is attached to the DOM.
     */
    onAttach: NoOp,

    /**
     * Method will be executed before the View is detached from the DOM.
     */
    onDetach: NoOp,

    /**
     * Method will be executed to create the View structure within the current View.
     */
    render: NoOp
});