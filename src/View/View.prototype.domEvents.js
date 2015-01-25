extend(View.prototype, {

    /**
     * Delegate non-bubbling or custom events to DOMEventProxy.
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var customEvents = this._customEvents,
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

    undelegate: function (type) {
        var selector = this._customEvents[type],
            node = this.find(selector);

        wig.env.uiEventProxy.removeListener(node, type);
    },

    undelegateAll: function () {
        Object.keys(this._customEvents).forEach(this.undelegate, this);
    },

    listenFor: function (type) {
        wig.env.uiEventProxy.startListenTo(type);
    },

    fireDOMEvent: function (event) {
        var listener = this.events[event.type];

        if (typeof listener !== 'function') {
            listener = (this[listener] || this.callbacks[listener]);
        }

        if (listener) {
            return listener.call(this, event);
        }
    },

    hasEvent: function (event) {
        return !!(this.events && this.events[event.type]);
    }
});