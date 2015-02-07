// helper module to provide privacy on the public View interface
var ViewHelper = module.ViewHelper = Class.extend({

    constructor: function (viewManager, uiEventProxy, dom, insurer) {
        Class.apply(this, arguments);

        this.DOM = dom;
        this.Insurer = insurer;
        this.ViewManager = viewManager;
        this.UIEventProxy = uiEventProxy;
    },

    /**
     * @param {View}     view
     * @param {Function} ViewClass
     * @param {object}   options
     */
    createChildView: function (view, ViewClass, options) {
        var childView = new ViewClass(options);
        this.ViewManager.registerChildForView(view, childView);
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
            html = this.ViewManager.compileTemplate(view);

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

        this.DOM.initNode(view.getNode(), classes);
    },

    // Method is invoked by remove
    destroy: function (view) {
        var node = view.getNode(),
            parentNode = node.parentNode;
        // remove custom events and notify children about removal
        this.undelegateAll(view);
        this.notifyDetach(view);

        if (parentNode) {
            parentNode.removeChild(node);
        }

        this.ViewManager.emptyView(view);

        node.innerHTML = '';
        view.node = null;
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
        var expects = view.expects,
            prop,
            l;
        // remove default Wig specific properties
        delete context.id;
        delete context.css;
        delete context.node;

        if (typeof expects === 'object' && !Array.isArray(expects)) {
            expects = Object.keys(expects);
        }
        l = expects.length;

        while (l--) {
            prop = expects[l];
            this.Insurer.is.defined(
                view[prop], '[' + prop + '] is already defined on the View instance!');

            view[prop] = context[prop];
            delete context[prop];
        }
    },

    _serializeAndRemoveView: function (view, childViewID) {
        this.ViewManager
            .serializeChildForView(view, childViewID);

        view.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function (view) {
        var viewID = view.getID(),
            children = this.ViewManager.getChildViews(viewID);
        this.ViewManager
            .emptyContextRegistryForView(viewID);

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
            classes = [view.className],
            attributes = view.getAttributes();
        // data attributes
        dataset[DATA_ATTRIBUTE] = view.getID();
        // add custom css
        if (view.css) {
            classes.push(view.css);
        }
        // assign classes and data context
        this.DOM.initNode(view.getNode(), classes, attributes, dataset);
        // apply event listeners
        Object.keys(view.events).forEach(view.listenFor, view);
        // initialize children
        this.initializeChildren(view);
    },

    /**
     * Method contains logic to serialize the View into a context.
     * @returns {object}
     */
    serialize: function (view) {
        return extend({}, view.defaults, view.context);
    },

    /**
     * Used by the UIEventProxy to execute the event handler on the view.
     * @param {View}  view
     * @param {Event} event
     */
    fireDOMEvent: function (view, event) {
        var listener = view.events[event.type];
        if (typeof listener !== 'function') {
            listener = view[listener];
        }
        if (listener) {
            return listener.call(view, event);
        }
    },

    /**
     * Used by the UIEventProxy to determine whether the view
     * has an event listener for the specified event type.
     * @param {View}  view
     * @param {Event} event
     */
    hasEvent: function (view, event) {
        return !!(view.events && view.events[event.type]);
    },

    /**
     * @param {Registry} view
     * @param {string}   type
     */
    undelegateType: function (view, type) {
        var viewID = view.getID(),
            customEvents = this.ViewManager.getCustomEventsForView(viewID),
            selectors = customEvents[type],
            l = selectors.length,
            node;

        while (l--) {
            node = view.find(selectors[l]);
            this.UIEventProxy.removeListener(node, type);
        }
    },

    /**
     * Undelegate all non-bubbling events registered for the View
     */
    undelegateAll: function (view) {
        var viewID = view.getID(),
            customEvents = this.ViewManager.getCustomEventsForView(viewID);

        Object.keys(customEvents).forEach(
            this.undelegateType.bind(this, view));
    }
});