var ViewRegistry = module.ViewRegistry = Registry.extend({

    getView: function (id) {
        var item = this.get(id);
        return (item && item.view);
    },

    getParentID: function (id) {
        var item = this.get(id);
        return (item && item.parent);
    },

    getChildViews: function (id) {
        var item = this.get(id);
        return (item && item.children);
    },

    getParent: function (id) {
        var item = this.get(id);
        return (item && item.parent);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    /**
     * Registers a (child) View instance in the ViewRegistry.
     * If parentView is specified, parent View's ID will be mapped against the child View's ID.
     * @param {View}  childView
     * @param {View} [parentView]
     */
    registerView: function (childView, parentView) {
        var viewID = childView.getID(),
            viewItem = new ViewRegistryItem(childView, parentView);

        this.set(viewID, viewItem);
    },

    removeView: function (view) {
        if (typeof view !== 'string') {
            view = view.getID();
        }

        this.get(view).contextRegistry.empty();
        this.unset(view);
    },

    getCustomEventsForView: function (viewID) {
        return this.get(viewID).getCustomEvents();
    },

    getContextRegistryForView: function (viewID) {
        return this.get(viewID).getContextRegistry();
    },

    setContextForChildView: function (viewID, childViewID, serializedChild) {
        this.getContextRegistryForView(viewID)
            .set(childViewID, serializedChild);
    },

    emptyViewContextRegistry: function (viewID) {
        this.getContextRegistryForView(viewID)
            .empty();
    }
});