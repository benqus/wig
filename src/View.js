/**
 * @class
 * @param    {object}  options
 * @property {string} [id]     - user defined or internal identifier
 * @property {string} [css]
 * @property {Node}   [node]
 */
var View = wig.View = Class.extend({

    constructor: function View(context) {
        context = (context || {});
        // assign the ID and register the View
        this._ID = (context.id || env.generateID('v'));
        env.viewRegistry.registerView(this);

        this.css      = (context.css || '');
        this.node     = (context.node || document.createElement(this.tagName));
        this.context  = {};
        this.attached = false;

        env.viewHelper.initializeWithContext(this, context);
    },

    // ////////// //
    // Properties //
    // ////////// //

    // strings
    tagName:   'div',
    className: 'View',

    // objects
    defaults:  {},
    renderMap: {},
    events:    {},

    /**
     * @type {View}
     */
    View: View,

    /**
     * @type {object|string[]}
     */
    expects: {},

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
        return env.getElement(node, selector);
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

    // Removes (destroys) the children.
    empty: function () {
        env.viewManager.getChildViews(this.getID())
            .forEach(this.removeView, this);
    },

    // Removes (destroys) the View and its children from the DOM.
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
            contextRegistry = env.viewRegistry.getContextRegistryForView(parentID),
            oldChildContext, newChildContext,
            options, childID, childView;
        // resolve arguments
        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }
        childOptions = (childOptions || {});
        // generate child id
        childID = parentID + '.' + (childOptions.id || env.generateID('v'));
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

    // /// ////// //
    // DOM Events //
    // /// ////// //

    /**
     * Delegate the UIEventProxy's listener to listen to
     * non-bubbling events on a node instead of the document
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var viewID = this.getID(),
            customEvents = env.viewRegistry.getCustomEventsForView(viewID),
            node;

        if (!customEvents[type]) {
            customEvents[type] = [];
        }

        if (customEvents[type].indexOf(selector) === -1) {
            node = this.find(selector);
            env.uiEventProxy.addListener(node, type);
            customEvents[type].push(selector || '');
        }
    },

    /**
     * UIEventProxy listening to the specified event type.
     * @param {string} type
     */
    listenFor: function (type) {
        env.uiEventProxy.startListenTo(type);
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
     * Returns additional, logic based attributes for the View's node.
     * @returns {string}
     */
    getAttributes: function () {
        return {};
    },

    /**
     * Method contains logic to parse the new context for the View.
     * @returns {string}
     */
    parseContext: function (newContext) {
        return newContext;
    },

    // Method will be executed after the View is attached to the DOM.
    onAttach: NoOp,

    // Method will be executed before the View is detached from the DOM.
    onDetach: NoOp,

    // Method will be executed to create the View structure within the current View.
    render: NoOp
});

View.extend = function (proto, statik) {
    statik = (statik || {});

    statik.add = View.add;
    proto.className = env.viewManager.inheritCSS(
        this.prototype.className,
        proto.className
    );

    return Class.extend.call(this, proto, statik);
};

View.add = function (options, parentView) {
    env.insurer.exists.object(
        parentView, 'Parent View cannot be undefined!');
    return parentView.addView(this, options);
};