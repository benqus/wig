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

/**
 * @class
 * @classdesc Compiles templates and caches them.
 */
var Compiler = wig.Compiler = Class.extend({

    start: '{{',
    end: '}}',

    constructor: function () {
        this.templateCache = new Registry();
        /**
         * RegExp to find the placeholders inside the templates.
         * @type {RegExp}
         */
        this.regExp = new RegExp(
            this.start + '\\s*[\\w\\d\\.]+\\s*' + this.end,
            'gim'
        );
    },

    /**
     * Memoizes a method for a placeholder to access attributes.
     * @param   {String} placeholder - eg: "{{ myPlaceholder }}"
     * @type    {Function}
     * @returns {Function}
     */
    compilerMethodFactory: function (placeholder) {
        var length = (placeholder.length - 2);
        var sanitized = placeholder.substring(2, length).trim().split(".");
        var l = sanitized.length;

        /**
         * Discovers the nested/attribute to fetch from attribute passed.
         * @param   {Object} map - attributes
         * @returns {String}
         */
        return function (map) {
            var result = map[sanitized[0]];
            var ns = map;
            var i = 0;

            // digging down the namespace
            if (l > 1) {
                while (ns && i < l) {
                    ns = ns[sanitized[i++]];
                }

                result = ns;
            }

            return result;
        };
    },

    /**
     * Generates a compiled, cache-able template to reuse.
     * @param   {String} text - eg: "hakuna {{ timon }} matata"
     * @type    {Function}
     * @returns {Array}
     */
    generateCompiledResult: function (text) {
        // placeholders to replace
        var placeholders = text.match(this.regExp);
        var i = 0;
        var splitText, compiledResults;

        if (placeholders) {
            // actual template content
            splitText = text.split(this.regExp);

            // precompiled array of content
            compiledResults = [];

            while (placeholders.length > 0) {
                compiledResults.push(
                    splitText[i],
                    this.compilerMethodFactory(placeholders.shift())
                );

                i += 1;
            }

            compiledResults.push(splitText[i]);

            this.templateCache.set(text, compiledResults);
        }

        return (this.templateCache.get(text) || text);
    },

    /**
     * Pre-compiles and caches the given template.
     * If attributes is defined, it will compile the template into a String.
     * @param   {String}  text   - eg: "hakuna {{ timon }} matata"
     * @param   {Object} [context] - context
     * @returns {String}
     */
    compile: function (text, context) {
        var compiledTemplate = this.templateCache.get(text);
        var markup = "";
        var item, i, l;

        if (!compiledTemplate) {
            compiledTemplate = this.generateCompiledResult(text);
        }

        // if a map of key-value pairs is provided, compile too
        if (context && typeof context === 'object') {
            for (i = 0, l = compiledTemplate.length; i < l; i++) {
                item = compiledTemplate[i];
                markup += (typeof item === 'function' ? item(context) : item);
            }
        }

        return markup;
    },

    /**
     * Returns the specified comiled markups.
     * @param   {String} template - eg: "hakuna {{ timon }} matata"
     * @returns {String}
     */
    getCompiled: function (template) {
        return this.templateCache.get(template);
    },

    /**
     * Disposes all previously compiled and cached markups.
     */
    disposeMarkups: function () {
        this.templateCache.empty();
    }

});

var DOM = wig.DOM = Class.extend({

    getElement: function (root, selector) {
        root = this.selectNode(root);
        return (selector ? root.querySelector(selector): root);
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

var Insurer = wig.Insurer = wig.Class.extend({

    is: {

        defined: function (arg, message) {
            if (typeof arg !== 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is defined (not null and not undefined)!');
            }
        },

        object: function (arg, message) {
            if (arg && typeof arg !== 'object') {
                throw new TypeError(message || 'Argument should be a function or undefined!');
            }
        },

        callable: function (arg, message) {
            if (arg && typeof arg !== 'function') {
                throw new TypeError(message || 'Argument should be a function or undefined!');
            }
        },

        number: function (arg, message) {
            if (arg !== 0 && arg && typeof arg !== 'number') {
                throw new TypeError(message || 'Argument should be a string or undefined!');
            }
        },

        string: function (arg, message) {
            if (arg !== '' && arg && typeof arg !== 'string') {
                throw new TypeError(message || 'Argument should be a string or undefined!');
            }
        }

    },

    exists: {

        object: function (arg, message) {
            if (arg == null || typeof arg !== 'object') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        },

        callable: function (arg, message) {
            if (arg == null || typeof arg !== 'function') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        },

        number: function (arg, message) {
            if (arg == null || typeof arg !== 'number') {
                throw new TypeError(message || 'Argument must be a string!');
            }
        },

        string: function (arg, message) {
            if (arg == null || typeof arg !== 'string') {
                throw new TypeError(message || 'Argument must be a string!');
            }
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
     * Returns  {undefined} if key doesn't exist.
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
        var key, value;
        if (typeof callback === 'function') {
            for (key in this.root) {
                value = this.get(key);
                callback.call(thisArg || this, key, value);
            }
        }
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
            try {
                this.preserveSelection();
            } catch (e) {}

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
            if (path && path.length > 0) {
                do {
                    // dig down to find focused node
                    index = path.pop();
                    node = this.findNodeByIndex(index, node);
                } while (path.length !== 0);
            }

            // restore selection if node is an editable element
            try {
                this.restoreSelection(node);
            } catch (e) {}

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

    constructor: function (Compiler) {
        this.Compiler = Compiler;
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

        return this.Compiler.compile(template, context);
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

wig.compile = function (template, context) {
    return wig.env.compiler.compile(template, context);
};

/**
 * Merges all argument objects into the first one.
 * @param   {object} obj
 * @returns {object}
 */
function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1),
        argsLength = args.length,
        key,
        i;

    for (i = 0; i < argsLength; i += 1) {
        if (args[i] && typeof args[i] === 'object') {
            for (key in args[i]) {
                obj[key] = args[i][key];
            }
        }
    }

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
    wig.env.insurer = new Insurer();
    wig.env.compiler = new Compiler();
    wig.env.template = new Template(wig.env.compiler);
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
    wig.env.insurer.exists.object(
        parentView, 'Parent View cannot be undefined!');
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
            index;

        if (childView) {
            index = this._children.indexOf(childView.getID());
            if (index > -1) {
                childView.destroy();
                this._children.splice(index, 1);
            }
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
            oldChildContext,
            newChildContext,
            options,
            childID,
            childView;

        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }

        childOptions = (childOptions || {});
        childID = parentID + '.' + (childOptions.id || wig.generateID('v'));

        // apply previous context
        oldChildContext = this._childContextBeforeUpdate.get(childID);
        newChildContext = extend({}, oldChildContext, childOptions);

        options = extend({}, newChildContext, {
            id: childID
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
        var selectors = this._customEvents[type],
            l = selectors.length,
            node;

        while (l--) {
            node = this.find(selectors[l]);
            wig.env.uiEventProxy.removeListener(node, type);
        }
    },

    undelegateAll: function () {
        Object.keys(this._customEvents).forEach(this.undelegate, this);
    },

    listenFor: function (type) {
        wig.env.uiEventProxy.startListenTo(type);
    },

    fireDOMEvent: function (event) {
        var listener = this.events[event.type];

        if (typeof listener !== 'function') {
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
        var dataset = {},
            classes = [this.className];

        dataset[DATA_ATTRIBUTE] = this.getID();

        if (this.css) {
            classes.push(this.css);
        }

        // assign classes and data context
        wig.env.dom.initNode(this.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        this._children.forEach(this.initializeChild);
    },

    get: function (key) {
        return (this.context[key] || this.defaults[key]);
    },

    set: function (newContext) {
        var overrides;

        if (newContext && typeof newContext === 'object') {
            overrides = extend({}, this.defaults, this.context, newContext);
            overrides = (this.parseContext(overrides) || overrides);
            extend(this.context, overrides);
        }
    },

    parseContext: function (newContext) {
        return newContext;
    },

    invoke: function (callback) {
        var args = Array.prototype.slice.call(arguments, 1);

        if (typeof this[callback] === 'function') {
            this[callback].apply(null, args);
        }
    },

    cleanupContext: function (context) {
        var props = this.props,
            prop,
            l;

        // remove default Wig specific properties
        delete context.id;
        delete context.css;
        delete context.node;

        if (typeof this.props === 'object' && !Array.isArray(this.props)) {
            props = Object.keys(this.props);
        }
        l = props.length;

        while (l--) {
            prop = props[l];
            wig.env.insurer.is.defined(
                this[prop], '[' + prop + '] is already defined on the View instance!');

            this[prop] = context[prop];
            delete context[prop];
        }
    },

    updateCSSClasses: function () {
        wig.env.dom.initNode(this.getNode(), [
            this.className,
            this.css,
            this.getCSS()
        ]);
    },

    getCSS: function () {
         return '';
    },

    getID: function () {
        return this._ID;
    },

    getContext: function () {
        return this.context;
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

    update: function (context) {
        this.notifyDetach();
        this.set(context);
        wig.env.viewManager.updateView(this);
        this.notifyAttach();
    },

    serialize: function () {
        return extend({}, this.defaults, this.context);
    },

    paint: function () {
        var node = this.getNode(),
            html = wig.env.template.compileTemplateForView(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext();
        this.updateCSSClasses();
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

        this.node.innerHTML = '';
        this.node = null;

        View.removeView(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        this._childContextBeforeUpdate.set(childViewID, serializedChild);
        this.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function () {
        this._childContextBeforeUpdate.empty();
        this._children.forEach(this._serializeAndRemoveView, this);
        this._children = [];
    }
});

extend(View.prototype, {
    /**
     * @type {string}
     */
    tagName: 'div',

    /**
     * @type {string}
     */
    className: 'View',

    /**
     * @type {object}
     */
    defaults: {},

    /**
     * @type {object}
     */
    renderMap: {},

    /**
     * @type {object}
     */
    dataMap: {},

    /**
     * @type {object}
     */
    events: {},

    /**
     * @type {View}
     */
    View: View,

    /**
     * @type {object|string[]}
     */
    props: {},

    /**
     * @type {string|string[]|function}
     */
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