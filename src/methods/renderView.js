/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node.appendChild(view.getNode());

    env.ViewHelper.paint(view);
    env.ViewHelper.notifyAttach(view);

    return view;
}

wig.renderView = renderView;