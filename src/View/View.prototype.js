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
        wig.env.dom.initNode(this.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        wig.env.viewManager.getChildViews(id)
            .forEach(this.initializeChild);
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
            wig.env.insurer.is.defined(
                this[prop], '[' + prop + '] is already defined on the View instance!');

            this[prop] = context[prop];
            delete context[prop];
        }
    },

    updateCSSClasses: function () {
        var classes = [this.className],
            customCSS = this.getCSS();

        if (this.css) {
            classes.push(this.css);
        }
        if(customCSS) {
            classes.push(customCSS);
        }

        wig.env.dom.initNode(this.getNode(), classes);
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
        this.updateCSSClasses();
        this.render();
        wig.env.viewManager.getChildViews(this.getID())
            .forEach(this.paintChildView, this);
    },

    notifyAttach: function () {
        this.attached = true;
        this.onAttach();
        wig.env.viewManager.getChildViews(this.getID()).forEach(
            wig.env.viewManager.notifyViewAboutAttach, wig.env.viewManager);
    },

    notifyDetach: function () {
        this.attached = false;
        this.onDetach();
        wig.env.viewManager.getChildViews(this.getID()).forEach(
            wig.env.viewManager.notifyViewAboutDetach, wig.env.viewManager);
    },

    // Method is invoked by remove
    destroy: function () {
        var parentNode = this.node.parentNode;
        // remove custom events and notify children about removal
        this.undelegateAll();
        this.notifyDetach();

        if (parentNode) {
            parentNode.removeChild(this.node);
        }

        wig.env.viewManager.getChildViews(this.getID())
            .forEach(this.removeView, this);

        this.node.innerHTML = '';
        this.node = null;

        View.removeView(this);
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
            children = wig.env.viewManager.getChildViews(id);
        // empty child context registry
        View.Registry.get(id)
            .contextRegistry.empty();

        while (children.length > 0) {
            // method below will shift children out form the array
            this._serializeAndRemoveView(children[0]);
        }
    }
});