/**
 * @class
 * @param    {object}  options
 * @property {string} [id]     - user defined or internal identifier
 * @property {string} [css]
 * @property {Node}   [node]
 */
var View = wig.View = Class.extend({

    constructor: function View(context) {
        var p;

        context = (context || {});

        this._ID           = (context.id || generateID('v'));
        this._children     = [];
        this._customEvents = {};
        this._childContextBeforeUpdate = new Registry();

        this.attached  = false;
        this.css       = (context.css || '');
        this.node      = (context.node || document.createElement(this.tagName));
        this.callbacks = (context.callbacks || {});
        this.context   = {};

        this.cleanupContext(context);

        // update default/initial context
        this.set(context);
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