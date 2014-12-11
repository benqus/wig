/**
 *
 * @param {Node} node
 */
function destroyViewAtNode(node) {
    var view = getViewAtNode(node);
    if (view) {
        view.destroy();
    }
}
