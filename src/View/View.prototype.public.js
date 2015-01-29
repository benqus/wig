/*
 * Public methods
 */
extend(View.prototype, {

    get: function (key) {
        return (this.context[key] || this.defaults[key]);
    },

    getID: function () {
        return this._ID;
    },

    getNode: function () {
        return this.node;
    },

    /**
     * Updates the View's context object - does not update the View itself
     * @param {object} newContext
     */
    set: function (newContext) {
        var overrides;
        if (newContext && typeof newContext === 'object') {
            overrides = extend({}, this.defaults, this.context, newContext);
            extend(this.context, (this.parseContext(overrides) || overrides));
        }
    },

    /**
     * Sets the View for another Element and reinitializes it.
     * @param {Element} node
     */
    setNode: function (node) {
        if (node) {
            this.node = node;
            this.initialize();
        }
    },

    /**
     * Finds an Element within the View's DOM Element.
     * @param   {string} selector
     * @returns {Node}
     */
    find: function (selector) {
        var node = this.getNode();
        if (!selector) {
            return node;
        }
        return wig.env.dom.getElement(node, selector);
    },

    /**
     * Updates (rerenders) the View and its children.
     * @param {object} [context] - context updates
     */
    update: function (context) {
        this.notifyDetach();
        this.set(context);
        wig.env.viewManager.updateView(this);
        this.notifyAttach();
    },

    /**
     * Helper method to invoke a method on the View.
     * @param {string} methodName
     */
    invoke: function (methodName) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof this[methodName] === 'function') {
            this[methodName].apply(null, args);
        }
    },

    /**
     * Removes (destroys) the children.
     */
    empty: function () {
        this._children.forEach(this.removeView, this);
    },

    /**
     * Removes (destroys) the View and its children from the DOM.
     */
    remove: function () {
        wig.env.viewManager.removeViewFromParent(this);
    }
});