extend(View.prototype, {

    /**
     * Delegate non-bubbling or custom events to DOMEventProxy.
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var node;

        if (!this._customEvents[type]) {
            this._customEvents[type] = [];
        }

        if (this._customEvents[type].indexOf(selector) === -1) {
            node = this.find(selector);
            UIEventProxy.addListener(node, type);
            this._customEvents[type].push(selector || '');
        }
    },

    undelegate: function (type) {
        var selector = this._customEvents[type],
            node = this.find(selector);

        UIEventProxy.removeListener(node, type);
    },

    undelegateAll: function () {
        Object.keys(this._customEvents).forEach(this.undelegate, this);
    },

    listenFor: function (type) {
        UIEventProxy.startListenTo(type);
    },

    fireDOMEvent: function (event) {
        var listener = this.events[event.type];

        if (typeof listener !== 'function' || this[listener]) {
            listener = this[listener];
        }

        if (listener) {
            return listener.call(this, event);
        }
    },

    hasEvent: function (event) {
        return !!(this.events && this.events[event.type])
    }
});