var ViewManager = {

    getView: function (id) {
        var item = ViewRegistry.get(id);
        return item && item.view;
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            item = ViewRegistry.get(childID),
            parentID = (item && item.parent);

        return this.getView(parentID);
    },

    getViewAtNode: function (node) {
        node = DOM.selectNode(node);
        return this.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = parentView.getSelectorForChild(viewID),
            rootNode = parentView.getNode();

        if (selector) {
            rootNode = DOM.getElement(rootNode, selector);
        }

        return rootNode;
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.getParentView(view),
            rootNode,
            childNodeIndex;

        view.undelegateAll();

        Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        } else {
            rootNode = childNode.parentNode;
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        view.paint();

        DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);

        Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = ViewManager.getView(viewID);
        view.notifyAttach();
    },

    notifyViewAboutDetach: function (viewID) {
        var view = ViewManager.getView(viewID);
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
};

wig.ViewManager = ViewManager;