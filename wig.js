/**
* Wig - 0.2.0
*/
// Uses Node, AMD or browser globals to create a module. This example creates
// a global even when AMD is used. This is useful if you have some scripts
// that are loaded by an AMD loader, but they still want access to globals.
// If you do not need to export a global for the AMD case,
// see returnExports.js.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrictGlobal.js

// Defines a module "returnExportsGlobal" that depends another module called
// "b". Note that the name of the module is implied by the file name. It is
// best if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            return (root.wig = factory({}));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory({});
    } else {
        // Browser globals
        root.wig = factory({});
    }
}(this, function (wig) {

/*
 * @namespace
 * user overrides to introduce backwards compatibility or custom templating
 */
var api = wig.api = {

    /**
     * Method compiles a template with a context object.
     * If selector is empty or not defined it will return the original node
     * Introduce custom DOM query by override.
     * @param   {Element} element
     * @param   {string}  selector
     * @returns {Element}
     */
    getElement: function (element, selector) {
        return (selector ? element.querySelector(selector) : element);
    },

    /**
     * Method returns the currently active Element in the DOM.
     * Override method for older browser support.
     * @returns {Element}
     */
    getFocusedElement: function () {
        return document.activeElement;
    },

    /**
     * Method compiles a template with a context object.
     * Introduce custom template compilation by override.
     * @param   {string} template
     * @param   {object} context
     * @returns {String}
     */
    compile: function (template, context) {
        return wig.env.compiler.compile(template, context);
    }
};

// wig internal environment
var env = wig.env = {};

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
     * Discovers the nested/attribute to fetch from attribute passed.
     * @param   {string} sanitized - bound
     * @param   {Object} map - attributes
     * @returns {String}
     */
    replacer: function (sanitized, map) {
        var result = map[sanitized[0]],
            length = sanitized.length,
            ns = map,
            i = 0;
        // digging down the namespace
        if (length > 1) {
            while (ns && i < length) {
                ns = ns[sanitized[i++]];
            }
            result = ns;
        }
        return result;
    },

    /**
     * Memoizes a method for a placeholder to access attributes.
     * @param   {String} placeholder - eg: "{{ myPlaceholder }}"
     * @type    {Function}
     * @returns {Function}
     */
    compilerMethodFactory: function (placeholder) {
        var sanitized = placeholder.substring(
            this.start.length,
            placeholder.length - this.end.length
        );
        sanitized = sanitized.trim().split(".");

        return this.replacer.bind(this, sanitized);
    },

    /**
     * Generates a compiled, cache-able template to reuse.
     * @param   {String} text - eg: "hakuna {{ timon }} matata"
     * @type    {Function}
     * @returns {Array}
     */
    generateCompiledResult: function (text) {
        // placeholders to replace
        var placeholders = text.match(this.regExp),
            i = 0,
            splitText, compiledResults;

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
            // cache template
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
        var compiledTemplate = this.templateCache.get(text),
            markup = "",
            item, i, l;

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

    initNode: function (element, classSet, dataSet) {
        var classes = classSet,
            cl;

        if (Array.isArray(classSet)) {
            classes = classSet.join(' ');
        } else if (classSet && typeof classSet === 'object') {
            classes = [];
            for (cl in classSet) {
                if (classSet.hasOwnProperty(cl) && classSet[cl]) {
                    classes.push(cl);
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
        var node = wig.api.getFocusedElement();

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
        var node = wig.api.getFocusedElement(),
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

    getChildViews: function (id) {
        var item = this.ViewRegistry.get(id);
        return (item && item.children);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    getViewAtNode: function (node) {
        return this.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = parentView.getSelectorForChild(viewID),
            rootNode = parentView.getNode();

        return api.getElement(rootNode, selector);
    },

    compileTemplate: function (view) {
        var template = view.template,
            context = view.serialize();

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return api.compile(template, context);
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
 * provided prefix and the latest Id.
 * @param   {string} prefix
 * @returns {string}
 */
function generateID(prefix) {
    return ((prefix || 0) + Id++);
}

wig.generateID = generateID;

// initialize wig
wig.init = function () {
    wig.env.dom = new DOM();
    wig.env.insurer = new Insurer();
    wig.env.compiler = new Compiler();
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
    node.appendChild(view.getNode());

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
        // assign the ID and register the View
        this._ID = (context.id || generateID('v'));
        View.registerView(this);

        this.css      = (context.css || '');
        this.node     = (context.node || document.createElement(this.tagName));
        this.context  = {};
        this.attached = false;

        this.initializeWithContext(context);
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
            children: [],
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

/*
 * View child related operations
 */
extend(View.prototype, {

    // ////// //
    // PUBLIC //
    // ////// //

    /**
     * Creates and adds the child view specified by the child view's _ID attribute.
     * @param   {Function} [ViewClass]    - child View type
     * @param   {object}   [childOptions] - options to create the child with
     * @returns {View}
     */
    addView: function (ViewClass, childOptions) {
        var parentID = this.getID(),
            contextRegistry = View.Registry.get(parentID).contextRegistry,
            oldChildContext,
            newChildContext,
            options,
            childID,
            childView;
        // resolve arguments
        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }
        childOptions = (childOptions || {});
        // generate child id
        childID = parentID + '.' + (childOptions.id || wig.generateID('v'));
        // apply previous context
        oldChildContext = contextRegistry.get(childID);
        newChildContext = extend({}, oldChildContext, childOptions);
        // create child view
        options = extend(newChildContext, { id: childID });
        childView = this.createChildView(ViewClass, options);
        // render child view if parent (this) is attached
        if (this.attached) {
            this.paintChildView(childID);
        }

        return childView;
    },

    /**
     * Returns the child view specified by the child view's _ID attribute.
     * @param {string|number} childViewID
     */
    getView: function (childViewID) {
        var children = wig.env.viewManager.getChildViews(this.getID());
        // if id is an array index instead of a child's ID
        if (typeof childViewID === 'number' && childViewID < children.length) {
            childViewID = children[childViewID];
        }
        // if id is not an absolute id
        if (children.indexOf(childViewID) === -1) {
            childViewID = this.getID() + '.' + childViewID;
        }
        return wig.env.viewManager.getView(childViewID);
    },

    /**
     * Removes a child view specified by the child view's _ID attribute.
     * @param {string} childViewID
     */
    removeView: function (childViewID) {
        var childView = this.getView(childViewID),
            children = wig.env.viewManager.getChildViews(this.getID()),
            index;

        if (childView) {
            index = children.indexOf(childView.getID());
            if (index > -1) {
                childView.destroy();
                children.splice(index, 1);
            }
        }
    },

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

    /**
     * @param childViewID
     */
    updateChildView: function (childViewID) {
        var childView = this.getView(childViewID);
        if (childView) {
            childView.update();
        }
    },

    /**
     * @param childViewID
     */
    paintChildView: function (childViewID) {
        var childView = this.getView(childViewID);
        if (childView) {
            wig.env.viewManager.updateView(childView);
        }
    },

    /**
     * @param {View}   ViewClass
     * @param {object} options
     */
    createChildView: function (ViewClass, options) {
        var childView = new ViewClass(options);
        View.registerView(childView, this);
        wig.env.viewManager.getChildViews(this.getID())
            .push(childView.getID());
        return childView;
    }
});

/*
 * DOM event related methods for the View
 */
extend(View.prototype, {

    /**
     * @private
     * @param {Registry} customEvents
     * @param {string}   type
     */
    _undelegateType: function (customEvents, type) {
        var selectors = customEvents[type],
            l = selectors.length,
            node;

        while (l--) {
            node = this.find(selectors[l]);
            wig.env.uiEventProxy.removeListener(node, type);
        }
    },

    /**
     * Delegate the UIEventProxy's listener to listen to
     * non-bubbling events on a node instead of the document
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents,
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

    /**
     * Undelegate non-bubbling event registered for the View
     * @param {string} type
     */
    undelegate: function (type) {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents;

        this._undelegateType(customEvents, type);
    },

    /**
     * Undelegate all non-bubbling events registered for the View
     */
    undelegateAll: function () {
        var viewID = this.getID(),
            customEvents = View.Registry.get(viewID).customEvents;

        Object.keys(customEvents).forEach(
            this._undelegateType.bind(this, customEvents));
    },

    /**
     * UIEventProxy listening to the specified event type.
     * @param {string} type
     */
    listenFor: function (type) {
        wig.env.uiEventProxy.startListenTo(type);
    },

    /**
     * Used by the UIEventProxy to execute the event handler on the view.
     * @param {Event} event
     */
    fireDOMEvent: function (event) {
        var listener = this.events[event.type];
        if (typeof listener !== 'function') {
            listener = this[listener];
        }
        if (listener) {
            return listener.call(this, event);
        }
    },

    /**
     * Used by the UIEventProxy to determine whether the view
     * has an event listener for the specified event type.
     * @param {Event} event
     */
    hasEvent: function (event) {
        return !!(this.events && this.events[event.type]);
    }
});

// View prototype
extend(View.prototype, {

    // ///////// //
    // PROTECTED //
    // ///////// //

    initializeWithContext: function (context) {
        // update default/initial context
        this.cleanupContext(context);
        this.set(context);
        this.initialize();
    },

    initialize: function () {
        var dataset = {},
            classes = [this.className],
            id = this.getID();
        // data attributes
        dataset[DATA_ATTRIBUTE] = id;
        // add custom css
        if (this.css) {
            classes.push(this.css);
        }
        // assign classes and data context
        wig.env.dom.initNode(this.getNode(), classes, dataset);
        // apply event listeners
        Object.keys(this.events).forEach(this.listenFor, this);
        // initialize children
        wig.env.viewManager.getChildViews(id)
            .forEach(this.initializeChild);
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
        var classes = [this.className],
            customCSS = this.getCSS();

        if (this.css) {
            classes.push(this.css);
        }
        if(customCSS) {
            classes.push(customCSS);
        }

        wig.env.dom.initNode(this.getNode(), classes);
    },

    getSelectorForChild: function (id) {
        var childView = this.getView(id),
            childID = childView.getID().split('.').pop();
        return (this.renderMap[childID] || this.renderMap['*']);
    },

    paint: function () {
        var node = this.getNode(),
            html = env.viewManager.compileTemplate(this);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext();
        this.updateCSSClasses();
        this.render();
        wig.env.viewManager.getChildViews(this.getID())
            .forEach(this.paintChildView, this);
    },

    notifyAttach: function () {
        this.attached = true;
        this.onAttach();
        wig.env.viewManager.getChildViews(this.getID()).forEach(
            wig.env.viewManager.notifyViewAboutAttach, wig.env.viewManager);
    },

    notifyDetach: function () {
        this.attached = false;
        this.onDetach();
        wig.env.viewManager.getChildViews(this.getID()).forEach(
            wig.env.viewManager.notifyViewAboutDetach, wig.env.viewManager);
    },

    // Method is invoked by remove
    destroy: function () {
        var parentNode = this.node.parentNode;
        // remove custom events and notify children about removal
        this.undelegateAll();
        this.notifyDetach();

        if (parentNode) {
            parentNode.removeChild(this.node);
        }

        wig.env.viewManager.getChildViews(this.getID())
            .forEach(this.removeView, this);

        this.node.innerHTML = '';
        this.node = null;

        View.removeView(this);
    },

    _serializeAndRemoveView: function (childViewID) {
        var childView = this.getView(childViewID),
            serializedChild = childView.serialize();

        View.Registry.get(this.getID())
            .contextRegistry.set(childViewID, serializedChild);

        this.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function () {
        var id = this.getID(),
            children = wig.env.viewManager.getChildViews(id);
        // empty child context registry
        View.Registry.get(id)
            .contextRegistry.empty();

        while (children.length > 0) {
            // method below will shift children out form the array
            this._serializeAndRemoveView(children[0]);
        }
    }
});

/*
 * Methods that are allowed to be overriden/inherited/extended by user for custom logic.
 */
extend(View.prototype, {

    /**
     * Returns additional, logic based CSS classes for the View's node.
     * @returns {string}
     */
    getCSS: function () {
        return '';
    },

    /**
     * Returns the context to be rendered.
     * @returns {context}
     */
    getContext: function () {
        return this.context;
    },

    /**
     * Method contains logic to parse the new context for the View.
     * @returns {string}
     */
    parseContext: function (newContext) {
        return newContext;
    },

    /**
     * Method contains logic to serialize the View into a context.
     * @returns {string}
     */
    serialize: function () {
        return extend({}, this.defaults, this.context);
    },

    /**
     * Method will be executed after the View is attached to the DOM.
     */
    onAttach: NoOp,

    /**
     * Method will be executed before the View is detached from the DOM.
     */
    onDetach: NoOp,

    /**
     * Method will be executed to create the View structure within the current View.
     */
    render: NoOp
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

/*
 * Public methods
 */
extend(View.prototype, {

    get: function (key) {
        return (this.context[key] || this.defaults[key]);
    },

    getID: function () {
        return this._ID;
    },

    getNode: function () {
        return this.node;
    },

    /**
     * Updates the View's context object - does not update the View itself
     * @param {object} newContext
     */
    set: function (newContext) {
        var overrides;
        if (newContext && typeof newContext === 'object') {
            overrides = extend({}, this.defaults, this.context, newContext);
            extend(this.context, (this.parseContext(overrides) || overrides));
        }
    },

    /**
     * Sets the View for another Element and reinitializes it.
     * @param {Element} node
     */
    setNode: function (node) {
        if (node) {
            this.node = node;
            this.initialize();
        }
    },

    /**
     * Finds an Element within the View's DOM Element.
     * @param   {string} selector
     * @returns {Node}
     */
    find: function (selector) {
        var node = this.getNode();
        if (!selector) {
            return node;
        }
        return api.getElement(node, selector);
    },

    /**
     * Updates (rerenders) the View and its children.
     * @param {object} [context] - context updates
     */
    update: function (context) {
        this.notifyDetach();
        this.set(context);
        wig.env.viewManager.updateView(this);
        this.notifyAttach();
    },

    /**
     * Helper method to invoke a method on the View.
     * @param {string} methodName
     */
    invoke: function (methodName) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof this[methodName] === 'function') {
            this[methodName].apply(null, args);
        }
    },

    /**
     * Removes (destroys) the children.
     */
    empty: function () {
        wig.env.viewManager.getChildViews(this.getID())
            .forEach(this.removeView, this);
    },

    /**
     * Removes (destroys) the View and its children from the DOM.
     */
    remove: function () {
        wig.env.viewManager.removeViewFromParent(this);
    }
});

    wig.init();

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return wig;
}));