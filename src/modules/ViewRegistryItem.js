var ViewRegistryItem = wig.ViewRegistryItem = Class.extend({

    constructor: function (view, parentView) {
        this.view = view;
        this.parent = (parentView && parentView.getID());
        this.children = [];
        this.customEvents = {};
        this.contextRegistry = new Registry();
    },

    getCustomEvents: function () {
        return this.customEvents;
    },

    getContextRegistry: function () {
        return this.contextRegistry;
    }

});