var EventProxy = wig.EventProxy = {

    _subscriptions: {},

    _ensureTypeExists: function (type) {
        var subscriptions = this._subscriptions;

        if (!subscriptions[type]) {
            subscriptions[type] = [];
        }

        return subscriptions[type];
    },

    _removeSubscriptionByIndex: function (type, index) {
        this._subscriptions[type]
            .splice(index, 1);
    },

    on: function (type, callback, context, once) {
        var types = this._ensureTypeExists(type);
        types.push({
            callback: callback,
            once: once
        });
    },

    one: function (type, callback) {
        this.on(type, callback, true);
    },

    off: function (type, callback) {
        // TODO
    },

    trigger: function (type, data) {
        // TODO
    }

};