var ViewManager = wig.ViewManager = {

    getView: function (id) {
        var item = View.Registry.get(id);
        return (item && item.view);
    },

    getParent: function (id) {
        var item = View.Registry.get(id);
        return (item && item.parent);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = ViewManager.getParent(childID);

        return ViewManager.getView(parentID);
    },

    getViewAtNode: function (node) {
        node = wig.env.dom.selectNode(node);
        return ViewManager.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = parentView.getSelectorForChild(viewID),
            rootNode = parentView.getNode();

        if (selector) {
            rootNode = wig.env.dom.getElement(rootNode, selector);
        }

        return rootNode;
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = ViewManager.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        view.undelegateAll();

        wig.env.selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = ViewManager.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        view.paint();

        wig.env.dom.attachNodeToParent(childNode, rootNode, childNodeIndex);
        wig.env.selection.restoreSelectionInView(view);
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
        var parentView = ViewManager.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            view.destroy();
        }
    },

    destroyViewAtNode: function (node) {
        var view = ViewManager.getViewAtNode(node);
        if (view) {
            view.remove();
        }
    }
};