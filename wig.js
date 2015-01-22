/**
* Wig - 0.1.0
*/
(function (global, factory) {
    'use strict';

    var wig = {};

    factory(wig);

    if (global.wig) {
        wig._Wig = global.wig;
    }

    global.wig = wig;
}(window, function (wig) {
    "use strict";

/**
 * ID
 * @static
 * @private
 * @type {number}
 */
var Id = 0;

/**
 * noop
 * @static
 * @function
 */
var NoOp = function () {};

/**
 * Data attribute wig attaches the View#_ID to.
 * @static
 * @constant
 * @type {string}
 */
var DATA_ATTRIBUTE = 'wig_view_id';

var VIEW_DATA_ATTRIBUTE = 'data-' + DATA_ATTRIBUTE;

var arrayIndexOf = Array.prototype.indexOf;

wig.DATA_ATTRIBUTE = DATA_ATTRIBUTE;

wig.modules = {};
wig.env = {};

// TODO: improved templating with caching - maybe?

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

var DOM = wig.DOM = Class.extend({

    getElement: function (root, selector) {
        root = this.selectNode(root);
        return root.querySelector(selector);
    },

    selectNode: function (element) {
        if (typeof element === 'string') {
            element = this.getElement(document.body, element);
        }

        return element;
    },

    initNode: function (element, classSet, dataSet) {
        var classes = classSet,
            i;

        if (Array.isArray(classSet)) {
            classes = classSet.join(' ');
        } else if (classSet && typeof classSet === 'object') {
            classes = [];
            for (i in classSet) {
                if (classSet.hasOwnProperty(i) && classSet[i]) {
                    classes.push(i);
                }
            }
            classes = classes.join(' ');
        }

        if (classes) {
            element.className = classes;
        }

        if (dataSet) {
            extend(element.dataset, dataSet);
        }

        return element;
    },

    findClosestViewNode: function (element, attribute) {
        var attributeValue;

        do {
            attributeValue = element.getAttribute(attribute);

            if (attributeValue != null) {
                return attributeValue;
            }

            element = element.parentNode;
        } while (element !== document);
    },

    attachNodeToParent: function (childNode, parentNode, index) {
        if (typeof index === 'number') {
            parentNode.insertBefore(childNode, parentNode.children[index]);
        } else {
            parentNode.appendChild(childNode);
        }
    }

});

/**
 * @classdesc Provides a convenient API for a key-value pair store.
 * @class
 */
var Registry = wig.Registry = Class.extend({

    constructor: function () {
        this.root = {};
    },

    /**
     * Returns the stored value for the specified key.
     * Returns {undefined} if key doesn't exist.
     * @param   {string} key
     * @returns {*}
     */
    get: function (key) {
        return this.root[key];
    },

    /**
     * Registers a value for the specified key.
     * @param {string} key
     * @param {*}      value
     */
    set: function (key, value) {
        this.root[key] = value;
    },

    /**
     * Removes the value specified by the key.
     * @param {string} key
     */
    unset: function (key) {
        delete this.root[key];
    },

    /**
     * Iterates over each item in the registry and executes the provided callback for each value and key.
     * @param  {function}         callback
     * @param  {object|undefined} thisArg
     * @throws {TypeError}
     */
    each: function (callback, thisArg) {
        if (typeof callback !== 'function') {
            return;
        }

        thisArg = (thisArg || this);

        Object.keys(this.root).forEach(function (key) {
            var value = this.get(key);
            callback.call(thisArg, key, value);
        }, this);
    },

    /**
     * This is an internal method, don't use it!
     * Empties the registry.
     */
    empty: function () {
        Object.keys(this.root).forEach(this.unset, this);
    }
});

var Selection = wig.Selection = Class.extend({

    constructor: function (DOM) {
        this.DOM = DOM;

        this.id = undefined;
        this.path = undefined;
        this.start = 0;
        this.end = 0;
    },

    preserveSelection: function () {
        var node  = this.getSelectedNode();

        this.start = node.selectionStart;
        this.end   = node.selectionEnd;
    },

    getIndexOfNode: function (node, viewNode) {
        var path = [];

        do {
            path.push(node.classList[0] ||
                arrayIndexOf.call(node.parentNode.children, node));
            node = node.parentNode;
        } while (node !== viewNode);

        return path;
    },

    preserveSelectionInView: function (updatingView) {
        var node = document.activeElement,
            focusedViewID = this.DOM.findClosestViewNode(node, VIEW_DATA_ATTRIBUTE),
            updatingViewID = updatingView.getID(),
            viewNode;

        if (focusedViewID && focusedViewID === updatingViewID) {
            this.preserveSelection();

            viewNode = updatingView.getNode();

            this.id = updatingViewID;
            if (node !== viewNode) {
                this.path = (node.id || this.getIndexOfNode(node, viewNode));
            }
        }
    },

    restoreSelection: function (node) {
        if (typeof node.setSelectionRange !== 'function') {
            return;
        }

        node.setSelectionRange(this.start, this.end);
    },

    findNodeByIndex: function (index, node) {
        if (typeof index === 'number') {
            node = node.children[index];
        } else {
            node = node.children[0];
            if (node.classList[0] !== index) {
                do {
                    node = node.nextSibling;
                } while (node.classList[0] !== index);
            }
        }

        return node;
    },

    restoreSelectionInView: function (view) {
        // place focus in the node
        var node = view.getNode(),
            path = this.path,
            index;

        if (this.id && this.id === view.getID()) {
            if (path.length > 0) {
                do {
                    // dig down to find focused node
                    index = path.pop();
                    node = this.findNodeByIndex(index, node);
                } while (path.length !== 0);
            }

            // restore selection if node is an editable element
            this.restoreSelection(node);

            node.focus();

            this.id = undefined;
            this.path = undefined;
        }
    },

    getSelectedNode: function () {
        return document.activeElement;
    }
});

var Template = wig.Template = Class.extend({

    REGEXP: /\{\{\s*([\w\d\.]+)\s*\}\}/g,

    compile: function (template, context, view) {
        return template.replace(this.REGEXP, function (res) {
            var path = res.match(/[\w\d]+/g),
                attribute = path[0],
                ctx = (context[attribute] != null ? context : view),
                result;

            if (path.length > 1) {
                attribute = path.pop();
                while (path.length > 0) {
                    ctx = ctx[path.shift()];
                }
            }

            if (typeof ctx[attribute] === 'function') {
                return ctx[attribute](context);
            }

            result = ctx[attribute];

            if (typeof result === 'undefined') {
                result = res;
            }

            return result;
        });
    },

    compileTemplateForView: function (view) {
        var template = view.template,
            context = view.serialize();

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return this.compile(template, context, view);
    }
});

var UIEventProxy = wig.UIEventProxy = Class.extend({

    listeners: [],

    constructor: function (DOM, ViewManager) {
        this.DOM = DOM;
        this.ViewManager = ViewManager;
        this.listener = this.listener.bind(this);
    },

    findFirstViewAndFireEvent: function (event, view) {
        do {
            // find the first view that is listening to the same type of event
            if (view.hasEvent(event)) {
                view.fireDOMEvent(event);
                return;
            }

            view = this.ViewManager.getParentView(view);
        } while (view);
    },

    addListener: function (node, type) {
        node.addEventListener(type, this.listener);
    },

    removeListener: function (node, type) {
        node.removeEventListener(type, this.listener);
    },

    listener: function (event) {
        var viewID = this.DOM.findClosestViewNode(event.target, VIEW_DATA_ATTRIBUTE),
            view = this.ViewManager.getView(viewID);

        if (view) {
            return this.findFirstViewAndFireEvent(event, view);
        }
    },

    startListenTo: function (type) {
        if (!this.isListeningTo(type)) {
            this.listeners.push(type);
            this.addListener(document, type);
        }
    },

    stopListenTo: function (type) {
        var index = this.listeners.indexOf(type);
        if (index > -1) {
            this.removeListener(document, type);
            this.listeners.splice(index, 1);
        }
    },

    isListeningTo: function (type) {
        return (this.listeners.indexOf(type) > -1);
    }
});

var ViewManager = wig.ViewManager = Class.extend({

    constructor: function (ViewRegistry, DOM, Selection) {
        this.DOM = DOM;
        this.Selection = Selection;
        this.ViewRegistry = ViewRegistry;
    },

    getView: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.view);
    },

    getParent: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.parent);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    getViewAtNode: function (node) {
        node = this.DOM.selectNode(node);
        return this.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = parentView.getSelectorForChild(viewID),
            rootNode = parentView.getNode();

        if (selector) {
            rootNode = this.DOM.getElement(rootNode, selector);
        }

        return rootNode;
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        view.undelegateAll();

        this.Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        view.paint();

        this.DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);
        this.Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = this.getView(viewID);
        view.notifyAttach();
    },

    notifyViewAboutDetach: function (viewID) {
        var view = this.getView(viewID);
        view.notifyDetach();
    },

    removeViewFromParent: function (view) {
        var parentView = this.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            view.destroy();
        }
    },

    destroyViewAtNode: function (node) {
        var view = this.getViewAtNode(node);
        if (view) {
            view.remove();
        }
    }
});

/**
 * Merges all argument objects into the first one.
 * @param   {object} obj
 * @returns {object}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (o) {
        if (o && typeof o === 'object') {
            Object.keys(o).forEach(function (key) {
                obj[key] = o[key];
            });
        }
    });

    return obj;
}

wig.extend = extend;

/**
 * Generates a new unique string based on the
 * provided prefix and the latest View Id.
 * @param   {string} prefix
 * @returns {string}
 */
function generateID(prefix) {
    return ((prefix || 0) + Id++);
}

wig.generateID = generateID;

wig.init = function () {
    wig.env.dom = new DOM();
    wig.env.template = new Template();
    wig.env.selection = new Selection(wig.env.dom);

    wig.env.viewManager = new ViewManager(
        View.Registry, wig.env.dom, wig.env.selection);

    wig.env.uiEventProxy = new UIEventProxy(
        wig.env.dom, wig.env.viewManager);
};

/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node = wig.env.dom.selectNode(node);

    view.setNode(node);
    view.paint();
    view.notifyAttach();

    return view;
}

wig.renderView = renderView;

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

extend(View.prototype, {

    // ///////// //
    // PROTECTED //
    // ///////// //

    /**
     * @param childViewID
     */
    initializeChild: function (childViewID) {
        var childView = this.getView(childViewID);
        if (childView) {
            childView.initialize();
        }
    },

    createChildView: function (ViewClass, options) {
        var childView = new ViewClass(options);
        View.registerView(childView, this);
        this._children.push(childView.getID());
        return childView;
    },

    updateChildView: function (childViewID) {
        var childView = this.getView(childViewID);
        if (childView) {
            childView.update();
        }
    },

    paintChildView: function (childViewID) {
        var childView = this.getView(childViewID);
        if (childView) {
            wig.env.viewManager.updateView(childView);
        }
    },

    removeView: function (childViewID) {
        var childView = this.getView(childViewID),
            index = this._children.indexOf(childViewID);

        if (childView) {
            childView.destroy();
            this._children.splice(index, 1);
        }
    },

    // ////// //
    // PUBLIC //
    // ////// //

    /**
     * @param ViewClass
     * @param childOptions
     * @returns {*}
     */
    addView: function (ViewClass, childOptions) {
        var parentID = this.getID(),
            childAttributes,
            attributes,
            options,
            childID,
            childView;

        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }

        childOptions = (childOptions || {});
        childID = parentID + '.' + (childOptions.id || wig.generateID('v'));

        // apply previous attributes
        childAttributes = this._childAttributesBeforeUpdate.get(childID);
        attributes = extend({}, childAttributes, childOptions.attributes);

        options = extend({}, childOptions, {
            id: childID,
            attributes: attributes
        });

        childView = this.createChildView(ViewClass, options);

        // render child view if parent (this) is attached
        if (this.attached) {
            this.paintChildView(childID);
        }

        return childView;
    },

    getView: function (id) {
        // if id is an array index instead of a child's ID
        if (typeof id === 'number' && id < this._children.length) {
            id = this._children[id];
        }
        // if id is not an absolute id
        if (this._children.indexOf(id) === -1) {
            id = this.getID() + '.' + id;
        }
        return wig.env.viewManager.getView(id);
    }
});

extend(View.prototype, {

    /**
     * Delegate non-bubbling or custom events to DOMEventProxy.
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var customEvents = this._customEvents,
            node;

        if (!customEvents[type]) {
            customEvents[type] = [];
        }

        if (customEvents[type].indexOf(selector) === -1) {
            node = this.find(selector);
            wig.env.uiEventProxy.addListener(node, type);
            customEvents[type].push(selector || '');
        }
    },

    undelegate: function (type) {
        var selector = this._customEvents[type],
            node = this.find(selector);

        wig.env.uiEventProxy.removeListener(node, type);
    },

    undelegateAll: function () {
        Object.keys(this._customEvents).forEach(this.undelegate, this);
    },

    listenFor: function (type) {
        wig.env.uiEventProxy.startListenTo(type);
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
        return !!(this.events && this.events[event.type]);
    }
});

// View prototype
extend(View.prototype, {

    initialize: function () {
        var dataset = {};
        dataset[DATA_ATTRIBUTE] = this.getID();
        // assign classes and data attributes
        wig.env.dom.initNode(this.getNode(), this.className, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        this._children.forEach(this.initializeChild);
    },

    get: function (attribute) {
        return this.attributes[attribute];
    },

    set: function (attributes) {
        var overrides;

        if (attributes && typeof attributes === 'object') {
            overrides = this.parseAttributes(attributes);
            extend(this.attributes, this.defaults, attributes, overrides);
        }
    },

    parseAttributes: function (newAttributes) {
        return newAttributes;
    },

    getID: function () {
        return this._ID;
    },

    getAttributes: function () {
        return extend({}, this.attributes);
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.renderMap[childID] || this.renderMap['*']);
    },

    getNode: function () {
        return this.node;
    },

    setNode: function (node) {
        this.node = node;
        this.initialize();
    },

    find: function (selector) {
        var node = this.getNode();

        if (!selector) {
            return node;
        }

        return wig.env.dom.getElement(node, selector);
    },

    update: function (attributes) {
        this.notifyDetach();
        this.set(attributes);
        wig.env.viewManager.updateView(this);
        this.notifyAttach();
    },

    serialize: function () {
        return this.attributes;
    },

    paint: function () {
        var node = this.getNode(),
            html = wig.env.template.compileTemplateForView(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildAttributes();
        this.render();
        this._children.forEach(this.paintChildView, this);
    },

    empty: function () {
        this._children.forEach(this.removeView, this);
        this._children = [];
    },

    notifyAttach: function () {
        this.attached = true;
        this.onAttach();
        this._children.forEach(
            wig.env.viewManager.notifyViewAboutAttach, wig.env.viewManager);
    },

    notifyDetach: function () {
        this.attached = false;
        this.onDetach();
        this._children.forEach(
            wig.env.viewManager.notifyViewAboutDetach, wig.env.viewManager);
    },

    remove: function () {
        wig.env.viewManager.removeViewFromParent(this);
    },

    destroy: function () {
        var parentNode = this.node.parentNode;
        this.undelegateAll();
        this.notifyDetach();

        if (parentNode) {
            parentNode.removeChild(this.node);
        }

        this._children.forEach(this.removeView, this);
        this.node = null;

        View.removeView(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        this._childAttributesBeforeUpdate.set(childViewID, serializedChild);
        this.removeView(childViewID);
    },

    _emptyAndPreserveChildAttributes: function () {
        this._childAttributesBeforeUpdate.empty();
        this._children.forEach(this._serializeAndRemoveView, this);
        this._children = [];
    }
});

extend(View.prototype, {
    tagName: 'div',

    className: 'View',

    defaults: {},

    renderMap: {},

    dataMap: {},

    events: {},

    View: View,

    template: ''
});

// user defined methods defaulting to NoOp
[
    'onAttach',
    'onDetach',
    'onDestroy',
    'render'
].forEach(function (method) {
    View.prototype[method] = NoOp;
});

    wig.init();
}));