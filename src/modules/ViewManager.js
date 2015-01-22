var ViewManager = wig.ViewManager = Class.extend({

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

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    getViewAtNode: function (node) {
        node = this.DOM.selectNode(node);
        return this.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = parentView.getSelectorForChild(viewID),
            rootNode = parentView.getNode();

        if (selector) {
            rootNode = this.DOM.getElement(rootNode, selector);
        }

        return rootNode;
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        view.undelegateAll();

        this.Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        view.paint();

        this.DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);
        this.Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = this.getView(viewID);
        view.notifyAttach();
    },

    notifyViewAboutDetach: function (viewID) {
        var view = this.getView(viewID);
        view.notifyDetach();
    },

    removeViewFromParent: function (view) {
        var parentView = this.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            view.destroy();
        }
    },

    destroyViewAtNode: function (node) {
        var view = this.getViewAtNode(node);
        if (view) {
            view.remove();
        }
    }
});