var Class = wig.Class = function () {};

/**
 * @static
 * @param props
 * @param statik
 * @returns {*}
 */
Class.extend = function (props, statik) {
    var Super     = this,
        prototype = Object.create(Super.prototype),
        Constructor;

    // create constructor if not defined
    if (props && props.hasOwnProperty('constructor')) {
        Constructor = props.constructor;
    } else {
        Constructor = function () {
            Super.apply(this, arguments);
        };
    }
    // prototype properties
    extend(prototype, props);
    // Constructor (static) properties
    extend(Constructor, statik);
    Constructor.extend = Super.extend;
    // prototype inheritance
    Constructor.prototype = prototype;
    Constructor.prototype.constructor = Constructor;
    return Constructor;
};