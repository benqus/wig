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
    this._customEvents = {};
    this._children = [];
    this._ID = (options.id || generateID('v'));

    this.node = (options.node || document.createElement(this.tagName));
    this.attributes = {};
    this.attached = false;

    // update default/initial attributes
    this.set(options.attributes);
    this.initialize();

    addViewToRegistries(this);
}

/**
 * @static
 * @param props
 * @param statik
 * @returns {*}
 */
View.extend = function (props, statik) {
    var Super = this,
        prototype = Object.create(Super.prototype),
        classes = Super.prototype.className,
        Constructor;

    if (props) {
        // inherit CSS definitions
        if (props.className) {
            classes = [classes, props.className].join(' ');
        }
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
    Constructor.prototype.className = classes;
    return Constructor;
};

View.add = function (options, parentView) {
    return parentView.addView(this, options);
};

wig.View = View;