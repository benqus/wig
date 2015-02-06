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
        wig.env.viewManager.getChildViews(view.getID())
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
        var children = wig.env.viewManager.getChildViews(view.getID()),
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
    }
});