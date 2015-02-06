/*
 * Public methods
 */
extend(View.prototype, {

    // ////////// //
    // Properties //
    // ////////// //

    /**
     * @type {string}
     */
    tagName: 'div',

    /**
     * @type {string}
     */
    className: 'View',

    /**
     * @type {object}
     */
    defaults: {},

    /**
     * @type {object}
     */
    renderMap: {},

    /**
     * @type {object}
     */
    events: {},

    /**
     * @type {View}
     */
    View: View,

    /**
     * @type {object|string[]}
     */
    props: {},

    /**
     * @type {string|string[]|function}
     */
    template: '',

    // //// //
    // View //
    // //// //

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
        return api.getElement(node, selector);
    },

    /**
     * Updates (rerenders) the View and its children.
     * @param {object} [context] - context updates
     */
    update: function (context) {
        env.viewHelper.notifyDetach(this);
        this.set(context);
        env.viewManager.updateView(this);
        env.viewHelper.notifyAttach(this);
    },

    /**
     * Removes (destroys) the children.
     */
    empty: function () {
        env.viewManager.getChildViews(this.getID())
            .forEach(this.removeView, this);
    },

    /**
     * Removes (destroys) the View and its children from the DOM.
     */
    remove: function () {
        env.viewManager.removeViewFromParent(this);
    },

    // ///// ////////// //
    // Child operations //
    // ///// ////////// //

    /**
     * Creates and adds the child view specified by the child view's _ID attribute.
     * @param   {Function} [ViewClass]    - child View type
     * @param   {object}   [childOptions] - options to create the child with
     * @returns {View}
     */
    addView: function (ViewClass, childOptions) {
        var parentID = this.getID(),
            contextRegistry = View.Registry.get(parentID).contextRegistry,
            oldChildContext,
            newChildContext,
            options,
            childID,
            childView;
        // resolve arguments
        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }
        childOptions = (childOptions || {});
        // generate child id
        childID = parentID + '.' + (childOptions.id || wig.generateID('v'));
        // apply previous context
        oldChildContext = contextRegistry.get(childID);
        newChildContext = extend({}, oldChildContext, childOptions);
        // create child view
        options = extend(newChildContext, { id: childID });
        childView = env.viewHelper.createChildView(
            this, ViewClass, options);
        // render child view if parent (this) is attached
        if (this.attached) {
            env.viewHelper.paintChildView(this, childID);
        }

        return childView;
    },

    /**
     * Returns the child view specified by the child view's _ID attribute.
     * @param {string|number} childViewID
     */
    getView: function (childViewID) {
        var children = env.viewManager.getChildViews(this.getID());
        // if id is an array index instead of a child's ID
        if (typeof childViewID === 'number' && childViewID < children.length) {
            childViewID = children[childViewID];
        }
        // if id is not an absolute id
        if (children.indexOf(childViewID) === -1) {
            childViewID = this.getID() + '.' + childViewID;
        }
        return env.viewManager.getView(childViewID);
    },

    /**
     * Removes a child view specified by the child view's _ID attribute.
     * @param {string} childViewID
     */
    removeView: function (childViewID) {
        var childView = this.getView(childViewID),
            children = env.viewManager.getChildViews(this.getID()),
            index;

        if (childView) {
            index = children.indexOf(childView.getID());
            if (index > -1) {
                env.viewHelper.destroy(childView);
                children.splice(index, 1);
            }
        }
    },

    // ///////// //
    // Overrides //
    // ///////// //

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