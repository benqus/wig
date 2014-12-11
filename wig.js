/**
* wig - 0.1.0
*/
(function (global, decorator) {
    'use strict';

    var wig = {};

    decorator(wig);

    if (global.wig) {
        wig._Wig = global.wig;
    }

    global.wig = wig;
}(window, function (wig) {
var
    /**
     * View ID
     * @static
     * @private
     * @type {number}
     */
    Id = 0,

    /**
     * noop
     * @function
     */
    NoOp = function () {},

    /**
     * Map of registered Views
     * @type {object}
     */
    ViewRegistry = {},

    /**
     * Data attribute wig attaches the View#_ID to.
     * @type {string}
     */
    DATA_ATTRIBUTE = 'wig_view_id';



// TODO: Events

// TODO: memorize previous attributes when views update (recursively!!!)


function attachNodeToParent(childNode, parentNode, index) {
    if (typeof index === 'number') {
        parentNode.insertBefore(childNode, parentNode.children[index]);
    } else {
        parentNode.appendChild(childNode);
    }
}

/**
 *
 * @param {Node} node
 */
function destroyViewAtNode(node) {
    var view = getViewAtNode(node);
    if (view) {
        view.destroy();
    }
}

/**
 *
 * @param   {object} obj
 * @returns {*}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (o) {
        if (o) {
            Object.keys(o).forEach(function (key) {
                obj[key] = o[key];
            });
        }
    });

    return obj;
}

/**
 * Finds an element in the provided root HTMLElement.
 *
 * Override `wig.getElement`  if custom logic needed!
 *
 * @param   {string|HTMLElement} root     - Node or selector to search in
 * @param   {string}             selector - CSS selector
 * @returns {HTMLElement}
 */
function getElement(root, selector) {
    root = selectNode(root);
    return root.querySelector(selector);
}
/**
 *
 * @param   {View} parentView
 * @param   {View} childView
 * @returns {Node}
 */
function getRootNodeMapping(parentView, childView) {
    var viewID = childView.getID(),
        selector = parentView.getSelectorForChild(viewID),
        rootNode = parentView.getNode();

    if (selector) {
        rootNode = wig.getElement(rootNode, selector);
    }
    return rootNode;
}


function initNode(node, classes, dataMap) {
    var key;

    if (Array.isArray(classes)) {
        classes = classes.join(' ');
    } else if (typeof classes === 'object') {
        classes = Object.keys(classes).join(' ');

    }

    if (classes !== '') {
        node.className = classes;
    }

    if (dataMap) {
        extend(node.dataset, dataMap);
    }

    return node;
}

/**
 * Returns a View from the ViewRegistry.
 * @param   {string}    id - View's ID
 * @returns {View|null}
 */
function getView(id) {
    return (ViewRegistry[id] || null);
}

/**
 * Generates a new unique string based on the
 * provided prefix and the latest View Id.
 * @param   {string} prefix
 * @returns {string}
 */
function generateID(prefix) {
    return (prefix + Id++);
}

/**
 * Returns the View associated with a HTMLElement.
 * @param   {HTMLElement} node
 * @returns {View|null}
 */
function getViewAtNode(node) {
    node = selectNode(node);
    return getView(node.dataset[DATA_ATTRIBUTE]);
}
/**
 * @namespace wig
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node = selectNode(node);

    view.setNode(node);
    view.paint();
    view.notifyAttach();

    return view;
}

/**
 * Returns a DOM element based on a selector or the element itself.
 * @param   {string|HTMLElement} element
 * @returns {*}
 */
function selectNode(element) {
    if (typeof element === 'string') {
        element = wig.getElement(document.body, element);
    }

    return element;
}
/**
 * Updates the View#attributes by a key and a value or a map of key/value pairs.
 * @param {string|object} arg
 * @param {*}             value
 * @param {object}        attributes
 */
function setViewAttribute(arg, value, attributes) {
    if (typeof arg === 'object') {
        Object.keys(arg).forEach(function (key) {
            setViewAttribute(key, arg[key], attributes);
        });
    } else {
        attributes[arg] = value;
    }
}
/**
 * @param {View} view
 */
function updateView(view) {
    var parentID = view.getParentID(),
        childNode = view.getNode(),
        rootNode = childNode.parentNode,
        parentView,
        childNodeIndex;

    if (parentID) {
        parentView = getView(parentID);
        rootNode = getRootNodeMapping(parentView, view);
        childNodeIndex = Array.prototype.indexOf.call(rootNode, childNode);
    }

    if (childNodeIndex > -1) {
        rootNode.removeChild(childNode);
    }

    view.paint();

    attachNodeToParent(childNode, rootNode, childNodeIndex);
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
    extend(Constructor, statik, View);
    // prototype inheritance
    Constructor.prototype = prototype;
    Constructor.prototype.constructor = Constructor;
    return Constructor;
};
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

    this._ID = (options.id || generateID('v'));
    this._PID = options.parentID; // soft link to parent

    this.node = options.node;
    this.children = [];
    this.attributes = extend({}, options.attributes);

    this.initialize();

    ViewRegistry[this.getID()] = this;
}
// View prototype
extend(View.prototype, {
    tagName: 'div',

    className: 'View',

    mapping: {},

    get: function (attribute) {
        return this.attributes[attribute];
    },
    getAttributes: function () {
        return extend({}, this.attributes);
    },
    set: function (arg, value) {
        setViewAttribute(arg, value, this.attributes);
        this.update();
    },

    getID: function () {
        return this._ID;
    },

    getParentID: function () {
        return this._PID;
    },

    initialize: function () {
        var dataset = {};
        dataset[DATA_ATTRIBUTE] = this.getID();
        this.node = (this.node || document.createElement(this.tagName));
        initNode(this.getNode(), this.className, dataset);
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.mapping[childID] || this.mapping['*']);
    },

    getNode: function () {
        return this.node;
    },
    setNode: function (node) {
        this.node = node;
        this.initialize();
        this.notifyAttach();
    },

    addView: function (childOptions) {
        var options = {},
            parentID = this.getID(),
            childID,
            ViewClass;

        childOptions = (childOptions || {});
        ViewClass = (childOptions.ViewClass || View);
        childID = [
            parentID,
            (childOptions.id || this.children.length)
        ].join('.');

        delete childOptions.ViewClass;

        return this.createView(ViewClass, options, childOptions, {
            id: childID,
            parentID: parentID
        });
    },
    createView: function (ViewClass) {
        var args = Array.prototype.slice.call(arguments, 1),
            options = extend.apply(null, args),
            view = new ViewClass(options);
        this.children.push(view.getID());
        return view;
    },
    getView: function (id) {
        // if id is an array index instead of a child's ID
        if (typeof id === 'number' && id < this.children.length) {
            id = this.children[id];
        }
        return getView(id);
    },
    updateView: function (id) {
        var childView = this.getView(id);
        if (childView) {
            childView.update();
        }
    },

    update: function () {
        this.notifyDetach();
        updateView(this);
        this.notifyAttach();
    },

    paintView: function (id) {
        var childView = this.getView(id);
        updateView(childView);
    },
    paint: function () {
        var node = this.getNode(),
            // regenerate markup from template
            html = this.getMarkup();

        if (Array.isArray(html)) {
            html = html.join('');
        }

        node.innerHTML = (html || '');

        this.empty();
        this.render();
        this.children.forEach(this.paintView, this);
    },

    empty: function () {
        this.children.forEach(this.removeView, this);
        this.children = [];
    },
    removeView: function (childViewID) {
        var view = this.getView(childViewID),
            attributes = view.getAttributes();

        view.destroy();

        return attributes;
    },

    notifyAttach: function () {
        this.onAttach();
        this.children.forEach(function (childViewID) {
            var childView = this.getView(childViewID);
            childView.notifyAttach();
        }, this);
    },

    notifyDetach: function () {
        this.onDetach();
        this.children.forEach(function (childViewID) {
            var childView = this.getView(childViewID);
            childView.notifyDetach();
        }, this);
    },

    destroyView: function (childViewID) {
        var childView = this.getView(childViewID);
        childView.destroy();
    },

    destroy: function () {
        this.node = null;
        this.children.forEach(this.destroyView, this);
        delete ViewRegistry[this.getID()];
    }
});

// user defined methods defaulting to NoOp
['onDetach', 'onAttach', 'onDestroy', 'getMarkup', 'render'].forEach(function (method) {
    View.prototype[method] = NoOp;
});
extend(wig, {
    View: View,
    extend: extend,
    ViewRegistry: ViewRegistry,
    renderView: renderView,
    getView: getView,

    // Hook
    getElement: getElement,

    getViewAtNode: getViewAtNode,
    setViewAttribute: setViewAttribute,
    attachNodeToParent: attachNodeToParent,
    selectNode: selectNode,
    destroyViewAtNode: destroyViewAtNode
});
}));