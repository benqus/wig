/**
 *
 * @param   {View} parentView
 * @param   {View} childView
 * @returns {Node}
 */
function getRootNodeMapping(parentView, childView) {
    var viewID = childView.getID(),
        selector = parentView.getSelectorForChild(viewID),
        rootNode = parentView.getNode();

    if (selector) {
        rootNode = wig.getElement(rootNode, selector);
    }
    return rootNode;
}
