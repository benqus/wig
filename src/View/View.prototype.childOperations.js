/*
 * View child related operations
 */
extend(View.prototype, {

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
        childView = wig.env.viewHelper.createChildView(
            this, ViewClass, options);
        // render child view if parent (this) is attached
        if (this.attached) {
            wig.env.viewHelper.paintChildView(this, childID);
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
                env.viewHelper.destroy(childView);
                children.splice(index, 1);
            }
        }
    }
});