// View prototype
extend(View.prototype, {
    tagName: 'div',

    className: 'View',

    defaults: {},

    renderMap: {},

    dataMap: {},

    events: {},

    View: View,

    template: '',

    initialize: function () {
        var dataset = {};
        dataset[DATA_ATTRIBUTE] = this.getID();
        // assign classes and data attributes
        DOM.initNode(this.getNode(), this.className, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        this._children.forEach(this.initializeChild);
    },

    get: function (attribute) {
        return this.attributes[attribute];
    },

    set: function (attributes) {
        var overrides;

        if (attributes && typeof attributes === 'object') {
            overrides = this.parseAttributes(attributes);
            extend(this.attributes, this.defaults, attributes, overrides);
        }
    },

    parseAttributes: function (newAttributes) {
        return newAttributes;
    },

    getID: function () {
        return this._ID;
    },

    getAttributes: function () {
        return extend({}, this.attributes);
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

        return DOM.getElement(node, selector);
    },

    update: function (attributes) {
        this.notifyDetach();
        this.set(attributes);
        ViewManager.updateView(this);
        this.notifyAttach();
    },

    serialize: function () {
        return this.attributes;
    },

    paint: function () {
        var node = this.getNode(),
            html = Template.compileTemplateForView(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildAttributes();
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
        this._children.forEach(ViewManager.notifyViewAboutAttach);
    },

    notifyDetach: function () {
        this.attached = false;
        this.onDetach();
        this._children.forEach(ViewManager.notifyViewAboutDetach);
    },

    remove: function () {
        ViewManager.removeViewFromParent(this);
    },

    destroy: function () {
        var parentNode = this.node.parentNode;
        this.undelegateAll();
        this.notifyDetach();

        if (parentNode) {
            parentNode.removeChild(this.node);
        }

        this._children.forEach(this.removeView, this);
        this.node = null;
        removeViewFromRegistries(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        this._childAttributesBeforeUpdate.set(childViewID, serializedChild);
        this.removeView(childViewID);
    },

    _emptyAndPreserveChildAttributes: function () {
        this._childAttributesBeforeUpdate.empty();
        this._children.forEach(this._serializeAndRemoveView, this);
        this._children = [];
    }
});