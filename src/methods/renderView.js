/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node = wig.env.dom.selectNode(node);
    node.appendChild(view.getNode());

    view.paint();
    view.notifyAttach();

    return view;
}

wig.renderView = renderView;