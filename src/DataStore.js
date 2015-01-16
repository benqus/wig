
function DataStore(async) {
    this.root  = {};
    this.async = (!!async);
}

extend(DataStore.prototype, {

    _triggerChange: function (type, data) {
        if (this.async) {
            setTimeout(EventProxy.trigger
                .bind(EventProxy, type, data), 0);
        } else {
            EventProxy.trigger(type, data);
        }
    },

    _ensurePathIsArray: function (path) {
        if (Array.isArray(path)) {
            return path;
        }

        return path.split('.');
    },

    get: function (rawPath) {
        var path = this._ensurePathIsArray(rawPath),
            attribute = path.shift(),
            context = this.root;

        if (path.length === 0) {
            return context[attribute];
        }

        while (context && path.length > 0) {
            context = context[path.shift()];
        }

        return (context && context[attribute]);
    },

    set: function (rawPath, newValue) {
        var path = this._ensurePathIsArray(rawPath),
            attribute = path.shift(),
            context = this.root,
            oldValue;

        if (path.length === 0) {
            context[attribute] = newValue;
        } else {
            while (context && path.length > 0) {
                context = context[path.shift()];
            }

            if (context) {
                oldValue = context[attribute];
                context[attribute] = newValue;
            }
        }

        this._triggerChange(rawPath, {
            newValue: newValue,
            oldValue: oldValue
        });
    }

});

wig.DataStore = DataStore;