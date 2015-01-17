/**
 * @class View
 * @param    {object}  options
 * @property {object} [attributes]
 * @property {Node}   [node]
 * @property {string} [id] - user defined or internal identifier
 * @property {string} [parentID] - internal
 * @constructor
 */
function View(options) {
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

View.Registry = new Registry();

/**
 * Registers a (child) View instance in the ViewRegistry.
 * If parentView is specified, parent View's ID will be mapped against the child View's ID.
 * @param childView
 * @param parentView
 */
View.registerView = function (childView, parentView) {
    var viewID = childView.getID();

    View.Registry.set(viewID, {
        parent: (parentView && parentView.getID()),
        view: childView
    });
};

View.removeView = function (view) {
    if (typeof view !== 'string') {
        view = view.getID();
    }

    View.Registry.unset(view);
};

View.inheritCSSClasses = function (superClassName, className) {
    var classes = [superClassName];

    if (className) {
        classes.push(superClassName, className);
    }

    return classes.join(' ');
};

/**
 * @static
 * @param props
 * @param statik
 * @returns {*}
 */
View.extend = function (props, statik) {
    var Super     = this,
        prototype = Object.create(Super.prototype),
        Constructor;

    if (props) {
        // create constructor if not defined
        if (props.hasOwnProperty('constructor')) {
            Constructor = props.constructor;
        } else {
            Constructor = function () {
                Super.apply(this, arguments);
            };
        }
    }
    // prototype properties
    extend(prototype, props);
    // Constructor (static) properties
    extend(Constructor, statik);
    Constructor.add = View.add;
    Constructor.extend = View.extend;
    // prototype inheritance
    Constructor.prototype = prototype;
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.className = View.inheritCSSClasses(
        Super.prototype.className,
        props.className
    );

    return Constructor;
};

View.add = function (options, parentView) {
    return parentView.addView(this, options);
};

wig.View = View;