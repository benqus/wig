/**
 * @param {View} view
 */
function updateView(view) {
    var parentID = view.getParentID(),
        childNode = view.getNode(),
        rootNode = childNode.parentNode,
        parentView,
        childNodeIndex;

    if (parentID) {
        parentView = getView(parentID);
        rootNode = getRootNodeMapping(parentView, view);
        childNodeIndex = Array.prototype.indexOf.call(rootNode, childNode);
    }

    if (childNodeIndex > -1) {
        rootNode.removeChild(childNode);
    }

    view.paint();

    attachNodeToParent(childNode, rootNode, childNodeIndex);
}