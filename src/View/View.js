/**
 * @class
 * @param    {object}  options
 * @property {string} [id]     - user defined or internal identifier
 * @property {string} [css]
 * @property {Node}   [node]
 */
var View = wig.View = Class.extend({

    constructor: function View(context) {
        context = (context || {});

        this._ID           = (context.id || generateID('v'));
        this._children     = [];

        this.attached  = false;
        this.css       = (context.css || '');
        this.node      = (context.node || document.createElement(this.tagName));
        this.callbacks = (context.callbacks || {});
        this.context   = {};

        this.initializeWithContext(context);

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
            contextRegistry: new Registry(),
            customEvents: {},
            parent: (parentView && parentView.getID()),
            view: childView
        });
    },

    removeView: function (view) {
        if (typeof view !== 'string') {
            view = view.getID();
        }

        View.Registry.get(view).contextRegistry.empty();
        View.Registry.unset(view);
    },

    inheritCSS: function (superClassName, className) {
        if (className) {
            return superClassName + ' ' + className;
        }
        return superClassName;
    }
});

View.extend = function (proto, statik) {
    statik = (statik || {});

    statik.add = View.add;
    proto.className = View.inheritCSS(
        this.prototype.className,
        proto.className
    );

    return Class.extend.call(this, proto, statik);
};

View.add = function (options, parentView) {
    wig.env.insurer.exists.object(
        parentView, 'Parent View cannot be undefined!');
    return parentView.addView(this, options);
};