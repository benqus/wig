/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node = wig.DOM.selectNode(node);

    view.setNode(node);
    view.paint();
    view.notifyAttach();

    return view;
}

wig.renderView = renderView;