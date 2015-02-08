var UIEventProxy = module.UIEventProxy = Class.extend({

    listeners: [],

    constructor: function (ViewHelper, DOM, ViewManager) {
        this.DOM = DOM;
        this.ViewHelper = ViewHelper;
        this.ViewManager = ViewManager;
        this.listener = this.listener.bind(this);
    },

    findFirstViewAndFireEvent: function (event, view) {
        do {
            // find the first view that is listening to the same type of event
            if (this.ViewHelper.hasEvent(view, event)) {
                this.ViewHelper.fireDOMEvent(view, event);
                return;
            }

            view = this.ViewManager.getParentView(view);
        } while (view);
    },

    addListener: function (node, type) {
        node.addEventListener(type, this.listener);
    },

    removeListener: function (node, type) {
        node.removeEventListener(type, this.listener);
    },

    listener: function (event) {
        var viewID = this.DOM.findClosestViewNode(event.target, VIEW_DATA_ATTRIBUTE),
            view = this.ViewManager.getView(viewID);

        if (view) {
            return this.findFirstViewAndFireEvent(event, view);
        }
    },

    startListenTo: function (type) {
        if (!this.isListeningTo(type)) {
            this.listeners.push(type);
            this.addListener(document, type);
        }
    },

    stopListenTo: function (type) {
        var index = this.listeners.indexOf(type);
        if (index > -1) {
            this.removeListener(document, type);
            this.listeners.splice(index, 1);
        }
    },

    isListeningTo: function (type) {
        return (this.listeners.indexOf(type) > -1);
    }
});