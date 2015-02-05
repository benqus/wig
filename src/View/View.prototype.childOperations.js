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