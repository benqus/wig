var ViewManager = module.ViewManager = Class.extend({

    constructor: function (ViewRegistry, DOM, Selection) {
        this.DOM = DOM;
        this.Selection = Selection;
        this.ViewRegistry = ViewRegistry;
    },

    getView: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.view);
    },

    getParent: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.parent);
    },

    getChildViews: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.children);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    getViewAtNode: function (node) {
        return this.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = env.viewHelper.getSelectorForChild(parentView, viewID),
            rootNode = parentView.getNode();

        return env.getElement(rootNode, selector);
    },

    compileTemplate: function (view) {
        var template = view.template,
            context = env.viewHelper.serialize(view);

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return env.compile(template, context);
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        env.viewHelper.undelegateAll(view);

        this.Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        env.viewHelper.paint(view);

        this.DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);
        this.Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = this.getView(viewID);
        env.viewHelper.notifyAttach(view);
    },

    notifyViewAboutDetach: function (viewID) {
        var view = this.getView(viewID);
        env.viewHelper.notifyDetach(view);
    },

    removeViewFromParent: function (view) {
        var parentView = this.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            env.viewHelper.destroy(view);
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
        this.getChildViews(view.getID())
            .push(childView.getID());
    },

    serializeChildForView: function (view, childViewID) {
        var childView = view.getView(childViewID),
            serializedChild = env.viewHelper.serialize(childView);

        this.ViewRegistry
            .setContextForChildView(view.getID(), childViewID, serializedChild);
    },

    emptyContextRegistryForView: function (viewID) {
        // empty child context registry
        this.ViewRegistry
            .emptyViewContextRegistry(viewID);
    },

    emptyView: function (view) {
        this.getChildViews(view.getID())
            .forEach(view.removeView, view);

        this.ViewRegistry.removeView(view);
    }
});