// helper module to provide privacy on the public View interface
var ViewHelper = wig.ViewHelper = Class.extend({

    constructor: function (viewManager) {
        Class.apply(this, arguments);
        this.ViewManager = viewManager;
    },

    /**
     * @param {View}     view
     * @param {Function} ViewClass
     * @param {object}   options
     */
    createChildView: function (view, ViewClass, options) {
        var childView = new ViewClass(options);
        View.registerView(childView, view);
        this.ViewManager.getChildViews(view.getID())
            .push(childView.getID());
        return childView;
    },

    /**
     * @param {View} view
     */
    initializeChildren: function (view) {
        var children = this.ViewManager.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewManager.getView(children[i]);
            childView.initialize();
            i += 1;
        }
    },

    /**
     * @param {View}   view
     */
    paintChildren: function (view) {
        var children = this.ViewManager.getChildViews(view.getID()),
            length = children.length,
            i = 0,
            childView;

        while (i < length) {
            childView = this.ViewManager.getView(children[i]);
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

        env.dom.initNode(view.getNode(), classes);
    },

    // Method is invoked by remove
    destroy: function (view) {
        var node = view.getNode(),
            parentNode = node.parentNode;
        // remove custom events and notify children about removal
        view.undelegateAll();
        this.notifyDetach(view);

        if (parentNode) {
            parentNode.removeChild(node);
        }

        this.ViewManager.getChildViews(view.getID())
            .forEach(view.removeView, view);

        node.innerHTML = '';
        view.node = null;

        View.removeView(view);
    },

    notifyAttach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = true;
        view.onAttach();

        viewManager.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutAttach, viewManager);
    },

    notifyDetach: function (view) {
        var viewManager = this.ViewManager;

        view.attached = false;
        view.onDetach();

        viewManager.getChildViews(view.getID()).forEach(
            viewManager.notifyViewAboutDetach, viewManager);
    }

});