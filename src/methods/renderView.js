/**
 * @namespace wig
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node = selectNode(node);

    view.setNode(node);
    view.paint();
    view.notifyAttach();

    return view;
}
