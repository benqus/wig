// View prototype
extend(View.prototype, {

    // ///////// //
    // PROTECTED //
    // ///////// //

    initializeWithContext: function (context) {
        // update default/initial context
        this.cleanupContext(context);
        this.set(context);
        this.initialize();
    },

    initialize: function () {
        var dataset = {},
            classes = [this.className],
            id = this.getID();
        // data attributes
        dataset[DATA_ATTRIBUTE] = id;
        // add custom css
        if (this.css) {
            classes.push(this.css);
        }
        // assign classes and data context
        env.dom.initNode(this.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        env.viewHelper.initializeChildren(this);
    },

    cleanupContext: function (context) {
        var props = this.props,
            prop,
            l;
        // remove default Wig specific properties
        delete context.id;
        delete context.css;
        delete context.node;

        if (typeof this.props === 'object' && !Array.isArray(this.props)) {
            props = Object.keys(this.props);
        }
        l = props.length;

        while (l--) {
            prop = props[l];
            env.insurer.is.defined(
                this[prop], '[' + prop + '] is already defined on the View instance!');

            this[prop] = context[prop];
            delete context[prop];
        }
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.renderMap[childID] || this.renderMap['*']);
    },

    paint: function () {
        var node = this.getNode(),
            html = env.viewManager.compileTemplate(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext();
        this.render();
        env.viewHelper.updateCSSClasses(this);
        env.viewHelper.paintChildren(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        View.Registry.get(this.getID())
            .contextRegistry.set(childViewID, serializedChild);

        this.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function () {
        var id = this.getID(),
            children = env.viewManager.getChildViews(id);
        // empty child context registry
        View.Registry.get(id)
            .contextRegistry.empty();

        while (children.length > 0) {
            // method below will shift children out form the array
            this._serializeAndRemoveView(children[0]);
        }
    }
});