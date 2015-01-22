/**
 * @class View
 * @param    {object}  options
 * @property {object} [attributes]
 * @property {Node}   [node]
 * @property {string} [id] - user defined or internal identifier
 * @property {string} [parentID] - internal
 * @constructor
 */
var View = wig.View = Class.extend({

    constructor: function View(options) {
        options = (options || {});

        this._childAttributesBeforeUpdate = new Registry();

        this._ID           = (options.id || generateID('v'));
        this._children     = [];
        this._customEvents = {};

        this.node       = (options.node || document.createElement(this.tagName));
        this.attached   = false;
        this.attributes = {};

        // update default/initial attributes
        this.set(options.attributes);
        this.initialize();

        View.registerView(this);
    }
}, {

    Registry: new Registry(),

    /**
     * Registers a (child) View instance in the ViewRegistry.
     * If parentView is specified, parent View's ID will be mapped against the child View's ID.
     * @param childView
     * @param parentView
     */
    registerView: function (childView, parentView) {
        var viewID = childView.getID();

        View.Registry.set(viewID, {
            parent: (parentView && parentView.getID()),
            view: childView
        });
    },

    removeView: function (view) {
        if (typeof view !== 'string') {
            view = view.getID();
        }

        View.Registry.unset(view);
    },

    inheritCSSClasses: function (superClassName, className) {
        var classes = [superClassName];

        if (className) {
            classes.push(superClassName, className);
        }

        return classes.join(' ');
    }
});

View.extend = function (proto, statik) {
    statik = (statik || {});
    statik.add = View.add;
    return Class.extend.call(this, proto, statik);
};

View.add = function (options, parentView) {
    return parentView.addView(this, options);
};