var ViewManager = module.ViewManager = Class.extend({

    constructor: function (ViewHelper, ViewRegistry, DOM, Selection) {
        this.DOM = DOM;
        this.Selection = Selection;
        this.ViewHelper = ViewHelper;
        this.ViewRegistry = ViewRegistry;
    },

    getViewAtNode: function (node) {
        return this.ViewRegistry.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = this.ViewHelper.getSelectorForChild(parentView, viewID),
            rootNode = parentView.getNode();

        return wig.getElement(rootNode, selector);
    },

    compileTemplate: function (view) {
        var template = view.template,
            context = this.ViewHelper.serialize(view);

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return wig.compile(template, context);
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.ViewRegistry.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        this.ViewHelper.undelegateAll(view);

        this.Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        this.ViewHelper.paint(view);

        this.DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);
        this.Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = this.ViewRegistry.getView(viewID);
        this.ViewHelper.notifyAttach(view);
    },

    notifyViewAboutDetach: function (viewID) {
        var view = this.ViewRegistry.getView(viewID);
        this.ViewHelper.notifyDetach(view);
    },

    removeViewFromParent: function (view) {
        var parentView = this.ViewRegistry.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            this.ViewHelper.destroy(view);
        }
    },

    destroyViewAtNode: function (node) {
        var view = this.getViewAtNode(node);
        if (view) {
            view.remove();
        }
    },

    inheritCSS: function (superClassName, className) {
        if (className) {
            return superClassName + ' ' + className;
        }
        return superClassName;
    },

    getCustomEventsForView: function (viewID) {
        return this.ViewRegistry.getCustomEventsForView(viewID);
    },

    registerChildForView: function (view, childView) {
        this.ViewRegistry.registerView(childView, view);
        this.ViewRegistry.getChildViews(view.getID())
            .push(childView.getID());
    },

    serializeChildForView: function (view, childViewID) {
        var childView = view.getView(childViewID),
            serializedChild = this.ViewHelper.serialize(childView);

        this.ViewRegistry
            .setContextForChildView(view.getID(), childViewID, serializedChild);
    },

    emptyContextRegistryForView: function (viewID) {
        // empty child context registry
        this.ViewRegistry
            .emptyViewContextRegistry(viewID);
    },

    emptyView: function (view) {
        this.ViewRegistry.getChildViews(view.getID())
            .forEach(view.removeView, view);

        this.ViewRegistry.removeView(view);
    }
});