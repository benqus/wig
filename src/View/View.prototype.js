// View prototype
extend(View.prototype, {

    initialize: function (options) {
        var dataset = {},
            classes = [this.className];

        dataset[DATA_ATTRIBUTE] = this.getID();

        if (this.cssClass) {
            classes.push(this.cssClass);
        }

        // assign classes and data context
        wig.env.dom.initNode(this.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        this._children.forEach(this.initializeChild);
    },

    get: function (key) {
        return this.context[key];
    },

    set: function (context) {
        var overrides;

        if (context && typeof context === 'object') {
            overrides = this.parseContext(context);
            extend(this.context, this.defaults, context, overrides);
        }
    },

    parseContext: function (newContext) {
        return newContext;
    },

    invoke: function (callback) {
        var args = Array.prototype.slice.call(arguments, 1);

        if (typeof this.callbacks[callback] === 'function') {
            this.callbacks[callback].apply(null, args);
        }
    },

    updateCSSClasses: function () {
        var cssClasses = [
            this.className,
            (this.cssClass || this.getCSSClass())
        ];

        wig.env.dom.initNode(this.getNode(), cssClasses);
    },

    getCSSClass: function () {
         return '';
    },

    getID: function () {
        return this._ID;
    },

    getContext: function () {
        return this.context;
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.renderMap[childID] || this.renderMap['*']);
    },

    getNode: function () {
        return this.node;
    },

    setNode: function (node) {
        this.node = node;
        this.initialize();
    },

    find: function (selector) {
        var node = this.getNode();

        if (!selector) {
            return node;
        }

        return wig.env.dom.getElement(node, selector);
    },

    update: function (context) {
        this.notifyDetach();
        this.set(context);
        wig.env.viewManager.updateView(this);
        this.notifyAttach();
    },

    serialize: function () {
        return extend({}, this.defaults, this.context);
    },

    paint: function () {
        var node = this.getNode(),
            html = wig.env.template.compileTemplateForView(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext();
        this.updateCSSClasses();
        this.render();
        this._children.forEach(this.paintChildView, this);
    },

    empty: function () {
        this._children.forEach(this.removeView, this);
        this._children = [];
    },

    notifyAttach: function () {
        this.attached = true;
        this.onAttach();
        this._children.forEach(
            wig.env.viewManager.notifyViewAboutAttach, wig.env.viewManager);
    },

    notifyDetach: function () {
        this.attached = false;
        this.onDetach();
        this._children.forEach(
            wig.env.viewManager.notifyViewAboutDetach, wig.env.viewManager);
    },

    remove: function () {
        wig.env.viewManager.removeViewFromParent(this);
    },

    destroy: function () {
        var parentNode = this.node.parentNode;

        this.undelegateAll();
        this.notifyDetach();

        if (parentNode) {
            parentNode.removeChild(this.node);
        }

        this._children.forEach(this.removeView, this);

        this.node.innerHTML = '';
        this.node = null;

        View.removeView(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        this._childContextBeforeUpdate.set(childViewID, serializedChild);
        this.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function () {
        this._childContextBeforeUpdate.empty();
        this._children.forEach(this._serializeAndRemoveView, this);
        this._children = [];
    }
});