/**
 * Registers a (child) View instance in the ViewRegistry.
 * If parentView is specified, parent View's ID will be mapped against the child View's ID.
 * @param childView
 * @param parentView
 */
function addViewToRegistries(childView, parentView) {
    var childViewID = childView.getID(),
        item = {
            parent: (parentView && parentView.getID()),
            view: childView
        };

    ViewRegistry.set(childViewID, item);
}

wig.addViewToRegistries = addViewToRegistries;