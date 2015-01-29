/*
 * DOM event related methods for the View
 */
extend(View.prototype, {

    /**
     * @private
     * @param {Registry} customEvents
     * @param {string}   type
     */
    _undelegateType: function (customEvents, type) {
        var selectors = customEvents[type],
            l = selectors.length,
            node;

        while (l--) {
            node = this.find(selectors[l]);
            wig.env.uiEventProxy.removeListener(node, type);
        }
    },

    /**
     * Delegate the UIEventProxy's listener to listen to
     * non-bubbling events on a node instead of the document
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents,
            node;

        if (!customEvents[type]) {
            customEvents[type] = [];
        }

        if (customEvents[type].indexOf(selector) === -1) {
            node = this.find(selector);
            wig.env.uiEventProxy.addListener(node, type);
            customEvents[type].push(selector || '');
        }
    },

    /**
     * Undelegate non-bubbling event registered for the View
     * @param {string} type
     */
    undelegate: function (type) {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents;

        this._undelegateType(customEvents, type);
    },

    /**
     * Undelegate all non-bubbling events registered for the View
     */
    undelegateAll: function () {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents;

        Object.keys(customEvents).forEach(
            this._undelegateType.bind(this, customEvents));
    },

    /**
     * UIEventProxy listening to the specified event type.
     * @param {string} type
     */
    listenFor: function (type) {
        wig.env.uiEventProxy.startListenTo(type);
    },

    /**
     * Used by the UIEventProxy to execute the event handler on the view.
     * @param {Event} event
     */
    fireDOMEvent: function (event) {
        var listener = this.events[event.type];
        if (typeof listener !== 'function') {
            listener = this[listener];
        }
        if (listener) {
            return listener.call(this, event);
        }
    },

    /**
     * Used by the UIEventProxy to determine whether the view
     * has an event listener for the specified event type.
     * @param {Event} event
     */
    hasEvent: function (event) {
        return !!(this.events && this.events[event.type]);
    }
});