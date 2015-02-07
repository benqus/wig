var ViewRegistry = wig.ViewRegistry = Registry.extend({

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