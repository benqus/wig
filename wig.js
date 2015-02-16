/**
* wigjs - 0.2.1
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

var module = wig.module = {};

/**
 * @class
 * @classdesc Compiles templates and caches them.
 */
var Compiler = module.Compiler = Class.extend({

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

var DOM = module.DOM = Class.extend({

    initNode: function (element, classSet, attributes, dataSet) {
        var classes = classSet,
            cl;

        extend(element, attributes);
        extend(element.dataset, dataSet);

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

var Environment = wig.module.Environment = Class.extend({
    // wig View data attribute
    DATA_ATTRIBUTE: DATA_ATTRIBUTE,

    // initialize wig
    constructor: function () {
        this.Dom          = new DOM();
        this.Insurer      = new Insurer();
        this.Compiler     = new Compiler();
        this.Selection    = new Selection(this.Dom);
        this.ViewHelper   = new ViewHelper();
        this.ViewRegistry = new ViewRegistry();

        this.ViewManager = new ViewManager(this.ViewHelper,
            this.ViewRegistry, this.Dom, this.Selection);

        this.UIEventProxy = new UIEventProxy(
            this.ViewHelper, this.Dom, this.ViewRegistry);

        this.initialize();
    },

    initialize: function () {
        this.ViewHelper.setEnv(this.ViewManager, this.ViewRegistry,
            this.UIEventProxy, this.Dom, this.Insurer);
    },

    /**
     * Generates a new unique string based on the
     * provided prefix and the latest Id.
     * @param   {string} prefix
     * @returns {string}
     */
    generateID :function (prefix) {
        return ((prefix || 0) + Id++);
    }
});

var Insurer = module.Insurer = wig.Class.extend({

    is: {
        notDefined: function (arg, message) {
            if (typeof arg === 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is not defined!');
            }
        },
        defined: function (arg, message) {
            if (typeof arg !== 'undefined' || arg === null) {
                throw new TypeError(message || 'Argument is defined (not null and not undefined)!');
            }
        }
    },

    exists: {
        object: function (arg, message) {
            if (arg == null || typeof arg !== 'object') {
                throw new TypeError(message || 'Argument must be a function!');
            }
        }
    }
});

/**
 * @classdesc Provides a convenient API for a key-value pair store.
 * @class
 */
var Registry = module.Registry = Class.extend({

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

var ViewRegistry = module.ViewRegistry = Registry.extend({

    getView: function (id) {
        var item = this.get(id);
        return (item && item.view);
    },

    getParentID: function (id) {
        var item = this.get(id);
        return (item && item.parent);
    },

    getChildViews: function (id) {
        var item = this.get(id);
        return (item && item.children);
    },

    getParent: function (id) {
        var item = this.get(id);
        return (item && item.parent);
    },

    getParentView: function (childView) {
        var childID = childView.getID(),
            parentID = this.getParent(childID);

        return this.getView(parentID);
    },

    /**
     * Registers a (child) View instance in the ViewRegistry.
     * If parentView is specified, parent View's ID will be mapped against the child View's ID.
     * @param {View}  childView
     * @param {View} [parentView]
     */
    registerView: function (childView, parentView) {
        var viewID = childView.getID(),
            viewItem = new ViewRegistryItem(childView, parentView);

        this.set(viewID, viewItem);
    },

    removeView: function (view) {
        if (typeof view !== 'string') {
            view = view.getID();
        }

        this.get(view).contextRegistry.empty();
        this.unset(view);
    },

    getCustomEventsForView: function (viewID) {
        return this.get(viewID).getCustomEvents();
    },

    getContextRegistryForView: function (viewID) {
        return this.get(viewID).getContextRegistry();
    },

    setContextForChildView: function (viewID, childViewID, serializedChild) {
        this.getContextRegistryForView(viewID)
            .set(childViewID, serializedChild);
    },

    emptyViewContextRegistry: function (viewID) {
        this.getContextRegistryForView(viewID)
            .empty();
    }
});

var ViewRegistryItem = module.ViewRegistryItem = Class.extend({

    constructor: function (view, parentView) {
        this.view = view;
        this.parent = (parentView && parentView.getID());
        this.children = [];
        this.customEvents = {};
        this.contextRegistry = new Registry();
    },

    getCustomEvents: function () {
        return this.customEvents;
    },

    getContextRegistry: function () {
        return this.contextRegistry;
    }

});

var Selection = module.Selection = Class.extend({

    constructor: function (DOM) {
        this.DOM = DOM;

        this.id = undefined;
        this.path = undefined;
        this.start = 0;
        this.end = 0;
    },

    preserveSelection: function () {
        var node = wig.getFocusedElement();

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
        var node = wig.getFocusedElement(),
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

            // restore Selection if node is an editable element
            try {
                this.restoreSelection(node);
            } catch (e) {}

            node.focus();

            this.id = undefined;
            this.path = undefined;
        }
    }
});

var UIEventProxy = module.UIEventProxy = Class.extend({

    listeners: [],

    constructor: function (ViewHelper, DOM, ViewRegistry) {
        this.DOM = DOM;
        this.ViewHelper = ViewHelper;
        this.ViewRegistry = ViewRegistry;
        this.listener = this.listener.bind(this);
    },

    findFirstViewAndFireEvent: function (event, view) {
        do {
            // find the first view that is listening to the same type of event
            if (this.ViewHelper.hasEvent(view, event)) {
                this.ViewHelper.fireDOMEvent(view, event);
                return;
            }

            view = this.ViewRegistry.getParentView(view);
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
            view = this.ViewRegistry.getView(viewID);

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

// helper module to provide privacy on the public View interface
var ViewHelper = module.ViewHelper = Class.extend({

    constructor: function () {
        this.DOM = undefined;
        this.Insurer = undefined;
        this.ViewManager = undefined;
        this.UIEventProxy = undefined;
    },

    setEnv: function (viewManager, ViewRegistry, uiEventProxy, dom, insurer) {
        this.DOM = dom;
        this.Insurer = insurer;
        this.ViewManager = viewManager;
        this.ViewRegistry = ViewRegistry;
        this.UIEventProxy = uiEventProxy;
    },

    /**
     * @param {View}     view
     * @param {Function} ViewClass
     * @param {object}   options
     */
    createChildView: function (view, ViewClass, options) {
        var childView = new ViewClass(options);
        this.ViewManager.registerChildForView(view, childView);
        return childView;
    },

    /**
     * @param {View} view
     */
    initializeChildren: function (view) {
        var children = this.ViewRegistry.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewRegistry.getView(children[i]);
            childView.initialize();
            i += 1;
        }
    },

    paint: function (view) {
        var node = view.getNode(),
            html = this.ViewManager.compileTemplate(view);

        node.innerHTML = (html || '');

        this._emptyAndPreserveChildContext(view);
        view.render();
        this.updateCSSClasses(view);
        this.paintChildren(view);
    },

    /**
     * @param {View}   view
     */
    paintChildren: function (view) {
        var children = this.ViewRegistry.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewRegistry.getView(children[i]);
            this.ViewManager.updateView(childView);
            i += 1;
        }
    },

    /**
     * @param {View}   view
     * @param {string} childViewID
     */
    paintChildView: function (view, childViewID) {
        var childView = view.getView(childViewID);
        if (childView) {
            this.ViewManager.updateView(childView);
        }
    },

    updateCSSClasses: function (view) {
        var classes = [view.className],
            customCSS = view.getCSS();

        if (view.css) {
            classes.push(view.css);
        }
        if(customCSS) {
            classes.push(customCSS);
        }

        this.DOM.initNode(view.getNode(), classes);
    },

    // Method is invoked by remove
    destroy: function (view) {
        var node = view.getNode(),
            parentNode = node.parentNode;
        // remove custom events and notify children about removal
        this.undelegateAll(view);
        this.notifyDetach(view);

        if (parentNode) {
            parentNode.removeChild(node);
        }

        this.ViewManager.emptyView(view);

        node.innerHTML = '';
        view.node = null;
    },

    notifyAttach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = true;
        view.onAttach();

        this.ViewRegistry.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutAttach, viewManager);
    },

    notifyDetach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = false;
        view.onDetach();

        this.ViewRegistry.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutDetach, viewManager);
    },

    cleanupContext: function (view, context) {
        var expects = view.expects,
            prop,
            l;
        // remove default Wig specific properties
        delete context.id;
        delete context.css;
        delete context.node;

        if (typeof expects === 'object' && !Array.isArray(expects)) {
            expects = Object.keys(expects);
        }
        l = expects.length;

        while (l--) {
            prop = expects[l];
            this.Insurer.is.defined(
                view[prop], '[' + prop + '] is already defined on the View instance!');

            view[prop] = context[prop];
            delete context[prop];
        }
    },

    _serializeAndRemoveView: function (view, childViewID) {
        this.ViewManager
            .serializeChildForView(view, childViewID);

        view.removeView(childViewID);
    },

    _emptyAndPreserveChildContext: function (view) {
        var viewID = view.getID(),
            children = this.ViewRegistry.getChildViews(viewID);
        this.ViewManager
            .emptyContextRegistryForView(viewID);

        while (children.length > 0) {
            // method below will shift children out form the array
            this._serializeAndRemoveView(view, children[0]);
        }
    },

    getSelectorForChild: function (view, id) {
        var childView = view.getView(id),
            childID = childView.getID().split('.').pop();
        return (view.renderMap[childID] || view.renderMap['*']);
    },

    initializeWithContext: function (view, context) {
        // update default/initial context
        this.cleanupContext(view, context);
        view.set(context);
        this.initialize(view);
    },

    initialize: function (view) {
        var dataset = {},
            classes = [view.className],
            attributes = view.getAttributes();
        // data attributes
        dataset[DATA_ATTRIBUTE] = view.getID();
        // add custom css
        if (view.css) {
            classes.push(view.css);
        }
        // assign classes and data context
        this.DOM.initNode(view.getNode(), classes, attributes, dataset);
        // apply event listeners
        Object.keys(view.events).forEach(view.listenFor, view);
        // initialize children
        this.initializeChildren(view);
    },

    /**
     * Method contains logic to serialize the View into a context.
     * @returns {object}
     */
    serialize: function (view) {
        return extend({}, view.defaults, view.context);
    },

    /**
     * Used by the UIEventProxy to execute the event handler on the view.
     * @param {View}  view
     * @param {Event} event
     */
    fireDOMEvent: function (view, event) {
        var listener = view.events[event.type];
        if (typeof listener !== 'function') {
            listener = view[listener];
        }
        if (listener) {
            return listener.call(view, event);
        }
    },

    /**
     * Used by the UIEventProxy to determine whether the view
     * has an event listener for the specified event type.
     * @param {View}  view
     * @param {Event} event
     */
    hasEvent: function (view, event) {
        return !!(view.events && view.events[event.type]);
    },

    /**
     * @param {Registry} view
     * @param {string}   type
     */
    undelegateType: function (view, type) {
        var viewID = view.getID(),
            customEvents = this.ViewManager.getCustomEventsForView(viewID),
            selectors = customEvents[type],
            l = selectors.length,
            node;

        while (l--) {
            node = view.find(selectors[l]);
            this.UIEventProxy.removeListener(node, type);
        }
    },

    /**
     * Undelegate all non-bubbling events registered for the View
     */
    undelegateAll: function (view) {
        var viewID = view.getID(),
            customEvents = this.ViewManager.getCustomEventsForView(viewID);

        Object.keys(customEvents).forEach(
            this.undelegateType.bind(this, view));
    }
});

var ViewManager = module.ViewManager = Class.extend({

    constructor: function (ViewHelper, ViewRegistry, DOM, Selection) {
        this.DOM = DOM;
        this.Selection = Selection;
        this.ViewHelper = ViewHelper;
        this.ViewRegistry = ViewRegistry;
    },

    getViewAtNode: function (node) {
        return this.ViewRegistry.getView(node.dataset[DATA_ATTRIBUTE]);
    },

    getRootNodeMapping: function (parentView, childView) {
        var viewID = childView.getID(),
            selector = this.ViewHelper.getSelectorForChild(parentView, viewID),
            rootNode = parentView.getNode();

        return wig.getElement(rootNode, selector);
    },

    compileTemplate: function (view) {
        var template = view.template,
            context = this.ViewHelper.serialize(view);

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return wig.compile(template, context);
    },

    updateView: function (view) {
        var childNode = view.getNode(),
            parent = this.ViewRegistry.getParentView(view),
            rootNode = childNode.parentNode,
            childNodeIndex;

        this.ViewHelper.undelegateAll(view);

        this.Selection.preserveSelectionInView(view);

        if (parent) {
            rootNode = this.getRootNodeMapping(parent, view);
        }

        childNodeIndex = arrayIndexOf.call(rootNode.children, childNode);

        if (childNodeIndex > -1) {
            rootNode.removeChild(childNode);
        }

        this.ViewHelper.paint(view);

        this.DOM.attachNodeToParent(childNode, rootNode, childNodeIndex);
        this.Selection.restoreSelectionInView(view);
    },

    notifyViewAboutAttach: function (viewID) {
        var view = this.ViewRegistry.getView(viewID);
        this.ViewHelper.notifyAttach(view);
    },

    notifyViewAboutDetach: function (viewID) {
        var view = this.ViewRegistry.getView(viewID);
        this.ViewHelper.notifyDetach(view);
    },

    removeViewFromParent: function (view) {
        var parentView = this.ViewRegistry.getParentView(view),
            childViewID = view.getID();

        if (parentView) {
            parentView.removeView(childViewID);
        } else {
            this.ViewHelper.destroy(view);
        }
    },

    destroyViewAtNode: function (node) {
        var view = this.getViewAtNode(node);
        if (view) {
            view.remove();
        }
    },

    inheritCSS: function (superClassName, className) {
        if (className) {
            return superClassName + ' ' + className;
        }
        return superClassName;
    },

    getCustomEventsForView: function (viewID) {
        return this.ViewRegistry.getCustomEventsForView(viewID);
    },

    registerChildForView: function (view, childView) {
        this.ViewRegistry.registerView(childView, view);
        this.ViewRegistry.getChildViews(view.getID())
            .push(childView.getID());
    },

    serializeChildForView: function (view, childViewID) {
        var childView = view.getView(childViewID),
            serializedChild = this.ViewHelper.serialize(childView);

        this.ViewRegistry
            .setContextForChildView(view.getID(), childViewID, serializedChild);
    },

    emptyContextRegistryForView: function (viewID) {
        // empty child context registry
        this.ViewRegistry
            .emptyViewContextRegistry(viewID);
    },

    emptyView: function (view) {
        this.ViewRegistry.getChildViews(view.getID())
            .forEach(view.removeView, view);

        this.ViewRegistry.removeView(view);
    }
});

/**
 * Method compiles a template with a context object.
 * Introduce custom template compilation by override.
 * @param   {string} template
 * @param   {object} context
 * @returns {String}
 */
wig.compile = function (template, context) {
    return env.Compiler.compile(template, context);
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
 * Method compiles a template with a context object.
 * If selector is empty or not defined it will return the original node
 * Introduce custom DOM query by override.
 * @param   {Element} element
 * @param   {string}  selector
 * @returns {Element}
 */
wig.getElement = function (element, selector) {
    return (selector ? element.querySelector(selector) : element);
};

/**
 * Method returns the currently active Element in the DOM.
 * Override method for older browser support.
 * @returns {Element}
 */
wig.getFocusedElement = function () {
    return document.activeElement;
};

/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node.appendChild(view.getNode());

    env.ViewHelper.paint(view);
    env.ViewHelper.notifyAttach(view);

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
        this._ID = (context.id || env.generateID('v'));
        env.ViewRegistry.registerView(this);

        this.css      = (context.css || '');
        this.node     = (context.node || document.createElement(this.tagName));
        this.context  = {};
        this.attached = false;

        env.ViewHelper.initializeWithContext(this, context);
    },

    // ////////// //
    // Properties //
    // ////////// //

    // strings
    tagName:   'div',
    className: 'View',

    // objects
    defaults:  {},
    renderMap: {},
    events:    {},

    /**
     * @type {View}
     */
    View: View,

    /**
     * @type {object|string[]}
     */
    expects: {},

    /**
     * @type {string|string[]|function}
     */
    template: '',

    // //// //
    // View //
    // //// //

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
        return wig.getElement(node, selector);
    },

    /**
     * Updates (rerenders) the View and its children.
     * @param {object} [context] - context updates
     */
    update: function (context) {
        env.ViewHelper.notifyDetach(this);
        this.set(context);
        env.ViewManager.updateView(this);
        env.ViewHelper.notifyAttach(this);
    },

    // Removes (destroys) the children.
    empty: function () {
        env.ViewRegistry.getChildViews(this.getID())
            .forEach(this.removeView, this);
    },

    // Removes (destroys) the View and its children from the DOM.
    remove: function () {
        env.ViewManager.removeViewFromParent(this);
    },

    // ///// ////////// //
    // Child operations //
    // ///// ////////// //

    /**
     * Creates and adds the child view specified by the child view's _ID attribute.
     * @param   {Function} [ViewClass]    - child View type
     * @param   {object}   [childOptions] - options to create the child with
     * @returns {View}
     */
    addView: function (ViewClass, childOptions) {
        var parentID = this.getID(),
            contextRegistry = env.ViewRegistry.getContextRegistryForView(parentID),
            oldChildContext, newChildContext,
            options, childID, childView;
        // resolve arguments
        if (ViewClass && typeof ViewClass === 'object') {
            childOptions = ViewClass;
            ViewClass = (this.View || View);
        }
        childOptions = (childOptions || {});
        // generate child id
        childID = parentID + '.' + (childOptions.id || env.generateID('v'));
        // apply previous context
        oldChildContext = contextRegistry.get(childID);
        newChildContext = extend({}, oldChildContext, childOptions);
        // create child view
        options = extend(newChildContext, { id: childID });
        childView = env.ViewHelper.createChildView(
            this, ViewClass, options);
        // render child view if parent (this) is attached
        if (this.attached) {
            env.ViewHelper.paintChildView(this, childID);
        }

        return childView;
    },

    /**
     * Returns the child view specified by the child view's _ID attribute.
     * @param {string|number} childViewID
     */
    getView: function (childViewID) {
        var children = env.ViewRegistry.getChildViews(this.getID());
        // if id is an array index instead of a child's ID
        if (typeof childViewID === 'number' && childViewID < children.length) {
            childViewID = children[childViewID];
        }
        // if id is not an absolute id
        if (children.indexOf(childViewID) === -1) {
            childViewID = this.getID() + '.' + childViewID;
        }
        return env.ViewRegistry.getView(childViewID);
    },

    /**
     * Removes a child view specified by the child view's _ID attribute.
     * @param {string} childViewID
     */
    removeView: function (childViewID) {
        var childView = this.getView(childViewID),
            children = env.ViewRegistry.getChildViews(this.getID()),
            index;

        if (childView) {
            index = children.indexOf(childView.getID());
            if (index > -1) {
                env.ViewHelper.destroy(childView);
                children.splice(index, 1);
            }
        }
    },

    // /// ////// //
    // DOM Events //
    // /// ////// //

    /**
     * Delegate the UIEventProxy's listener to listen to
     * non-bubbling events on a node instead of the document
     * @param {string} type
     * @param {string} selector
     */
    delegate: function (type, selector) {
        var viewID = this.getID(),
            customEvents = env.ViewRegistry.getCustomEventsForView(viewID),
            node;

        if (!customEvents[type]) {
            customEvents[type] = [];
        }

        if (customEvents[type].indexOf(selector) === -1) {
            node = this.find(selector);
            env.UIEventProxy.addListener(node, type);
            customEvents[type].push(selector || '');
        }
    },

    /**
     * UIEventProxy listening to the specified event type.
     * @param {string} type
     */
    listenFor: function (type) {
        env.UIEventProxy.startListenTo(type);
    },

    // ///////// //
    // Overrides //
    // ///////// //

    /**
     * Returns additional, logic based CSS classes for the View's node.
     * @returns {string}
     */
    getCSS: function () {
        return '';
    },

    /**
     * Returns additional, logic based attributes for the View's node.
     * @returns {string}
     */
    getAttributes: function () {
        return {};
    },

    /**
     * Method contains logic to parse the new context for the View.
     * @returns {string}
     */
    parseContext: function (newContext) {
        return newContext;
    },

    // Method will be executed after the View is attached to the DOM.
    onAttach: NoOp,

    // Method will be executed before the View is detached from the DOM.
    onDetach: NoOp,

    // Method will be executed to create the View structure within the current View.
    render: NoOp
});

View.extend = function (proto, statik) {
    statik = (statik || {});

    statik.add = View.add;
    proto.className = env.ViewManager.inheritCSS(
        this.prototype.className,
        proto.className
    );

    return Class.extend.call(this, proto, statik);
};

View.add = function (options, parentView) {
    env.Insurer.exists.object(
        parentView, 'Parent View cannot be undefined!');
    return parentView.addView(this, options);
};

    var env = wig.env = new Environment();

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return wig;
}));