// View prototype
extend(View.prototype, {
    tagName: 'div',

    className: 'View',

    mapping: {},

    get: function (attribute) {
        return this.attributes[attribute];
    },
    getAttributes: function () {
        return extend({}, this.attributes);
    },
    set: function (arg, value) {
        setViewAttribute(arg, value, this.attributes);
        this.update();
    },

    getID: function () {
        return this._ID;
    },

    getParentID: function () {
        return this._PID;
    },

    initialize: function () {
        var dataset = {};
        dataset[DATA_ATTRIBUTE] = this.getID();
        this.node = (this.node || document.createElement(this.tagName));
        initNode(this.getNode(), this.className, dataset);
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.mapping[childID] || this.mapping['*']);
    },

    getNode: function () {
        return this.node;
    },
    setNode: function (node) {
        this.node = node;
        this.initialize();
        this.notifyAttach();
    },

    addView: function (childOptions) {
        var options = {},
            parentID = this.getID(),
            childID,
            ViewClass;

        childOptions = (childOptions || {});
        ViewClass = (childOptions.ViewClass || View);
        childID = [
            parentID,
            (childOptions.id || this.children.length)
        ].join('.');

        delete childOptions.ViewClass;

        return this.createView(ViewClass, options, childOptions, {
            id: childID,
            parentID: parentID
        });
    },
    createView: function (ViewClass) {
        var args = Array.prototype.slice.call(arguments, 1),
            options = extend.apply(null, args),
            view = new ViewClass(options);
        this.children.push(view.getID());
        return view;
    },
    getView: function (id) {
        // if id is an array index instead of a child's ID
        if (typeof id === 'number' && id < this.children.length) {
            id = this.children[id];
        }
        return getView(id);
    },
    updateView: function (id) {
        var childView = this.getView(id);
        if (childView) {
            childView.update();
        }
    },

    update: function () {
        this.notifyDetach();
        updateView(this);
        this.notifyAttach();
    },

    paintView: function (id) {
        var childView = this.getView(id);
        updateView(childView);
    },
    paint: function () {
        var node = this.getNode(),
            // regenerate markup from template
            html = this.getMarkup();

        if (Array.isArray(html)) {
            html = html.join('');
        }

        node.innerHTML = (html || '');

        this.empty();
        this.render();
        this.children.forEach(this.paintView, this);
    },

    empty: function () {
        this.children.forEach(this.removeView, this);
        this.children = [];
    },
    removeView: function (childViewID) {
        var view = this.getView(childViewID),
            attributes = view.getAttributes();

        view.destroy();

        return attributes;
    },

    notifyAttach: function () {
        this.onAttach();
        this.children.forEach(function (childViewID) {
            var childView = this.getView(childViewID);
            childView.notifyAttach();
        }, this);
    },

    notifyDetach: function () {
        this.onDetach();
        this.children.forEach(function (childViewID) {
            var childView = this.getView(childViewID);
            childView.notifyDetach();
        }, this);
    },

    destroyView: function (childViewID) {
        var childView = this.getView(childViewID);
        childView.destroy();
    },

    destroy: function () {
        this.node = null;
        this.children.forEach(this.destroyView, this);
        delete ViewRegistry[this.getID()];
    }
});

// user defined methods defaulting to NoOp
['onDetach', 'onAttach', 'onDestroy', 'getMarkup', 'render'].forEach(function (method) {
    View.prototype[method] = NoOp;
});