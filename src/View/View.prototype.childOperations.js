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
        wig.addViewToRegistries(childView, this);
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
            ViewManager.updateView(childView);
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
        return ViewManager.getView(id);
    }
});