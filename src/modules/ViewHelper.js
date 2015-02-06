// helper module to provide privacy on the public View interface
var ViewHelper = wig.ViewHelper = Class.extend({

    constructor: function (viewManager) {
        Class.apply(this, arguments);
        this.ViewManager = viewManager;
    },

    /**
     * @param {View}     view
     * @param {Function} ViewClass
     * @param {object}   options
     */
    createChildView: function (view, ViewClass, options) {
        var childView = new ViewClass(options);
        View.registerView(childView, view);
        this.ViewManager.getChildViews(view.getID())
            .push(childView.getID());
        return childView;
    },

    /**
     * @param {View} view
     */
    initializeChildren: function (view) {
        var children = this.ViewManager.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewManager.getView(children[i]);
            childView.initialize();
            i += 1;
        }
    },

    paint: function (view) {
        var node = view.getNode(),
            html = env.viewManager.compileTemplate(view);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext(view);
        view.render();
        this.updateCSSClasses(view);
        this.paintChildren(view);
    },

    /**
     * @param {View}   view
     */
    paintChildren: function (view) {
        var children = this.ViewManager.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewManager.getView(children[i]);
            this.ViewManager.updateView(childView);
            i += 1;
        }
    },

    /**
     * @param {View}   view
     * @param {string} childViewID
     */
    paintChildView: function (view, childViewID) {
        var childView = view.getView(childViewID);
        if (childView) {
            this.ViewManager.updateView(childView);
        }
    },

    updateCSSClasses: function (view) {
        var classes = [view.className],
            customCSS = view.getCSS();

        if (view.css) {
            classes.push(view.css);
        }
        if(customCSS) {
            classes.push(customCSS);
        }

        env.dom.initNode(view.getNode(), classes);
    },

    // Method is invoked by remove
    destroy: function (view) {
        var node = view.getNode(),
            parentNode = node.parentNode;
        // remove custom events and notify children about removal
        view.undelegateAll();
        this.notifyDetach(view);

        if (parentNode) {
            parentNode.removeChild(node);
        }

        this.ViewManager.getChildViews(view.getID())
            .forEach(view.removeView, view);

        node.innerHTML = '';
        view.node = null;

        View.removeView(view);
    },

    notifyAttach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = true;
        view.onAttach();

        viewManager.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutAttach, viewManager);
    },

    notifyDetach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = false;
        view.onDetach();

        viewManager.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutDetach, viewManager);
    },

    cleanupContext: function (view, context) {
        var props = view.props,
            prop,
            l;
        // remove default Wig specific properties
        delete context.id;
        delete context.css;
        delete context.node;

        if (typeof view.props === 'object' && !Array.isArray(view.props)) {
            props = Object.keys(view.props);
        }
        l = props.length;

        while (l--) {
            prop = props[l];
            env.insurer.is.defined(
                view[prop], '[' + prop + '] is already defined on the View instance!');

            view[prop] = context[prop];
            delete context[prop];
        }
    },

    _serializeAndRemoveView: function (view, childViewID) {
        var childView = view.getView(childViewID),
            serializedChild = childView.serialize();

        View.Registry.get(view.getID())
            .contextRegistry.set(childViewID, serializedChild);

        view.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function (view) {
        var id = view.getID(),
            children = env.viewManager.getChildViews(id);
        // empty child context registry
        View.Registry.get(id)
            .contextRegistry.empty();

        while (children.length > 0) {
            // method below will shift children out form the array
            this._serializeAndRemoveView(view, children[0]);
        }
    },

    getSelectorForChild: function (view, id) {
        var childView = view.getView(id),
            childID = childView.getID().split('.').pop();
        return (view.renderMap[childID] || view.renderMap['*']);
    },

    initializeWithContext: function (view, context) {
        // update default/initial context
        this.cleanupContext(view, context);
        view.set(context);
        this.initialize(view);
    },

    initialize: function (view) {
        var dataset = {},
            classes = [view.className];
        // data attributes
        dataset[DATA_ATTRIBUTE] = view.getID();
        // add custom css
        if (view.css) {
            classes.push(view.css);
        }
        // assign classes and data context
        env.dom.initNode(view.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(view.events).forEach(view.listenFor, view);
        // initialize children
        env.viewHelper.initializeChildren(view);
    }
});