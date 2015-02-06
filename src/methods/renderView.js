/**
 * Renders the provided View instance into a DOM node.
 * @param   {View}    view
 * @param   {Element} node
 * @returns {View}
 */
function renderView(view, node) {
    node.appendChild(view.getNode());

    env.viewHelper.paint(view);
    env.viewHelper.notifyAttach(view);

    return view;
}

wig.renderView = renderView;