/**
 * Returns a View from the ViewRegistry.
 * @param   {string}    id - View's ID
 * @returns {View|null}
 */
function getView(id) {
    return (ViewRegistry[id] || null);
}

/**
 * Generates a new unique string based on the
 * provided prefix and the latest View Id.
 * @param   {string} prefix
 * @returns {string}
 */
function generateID(prefix) {
    return (prefix + Id++);
}

/**
 * Returns the View associated with a HTMLElement.
 * @param   {HTMLElement} node
 * @returns {View|null}
 */
function getViewAtNode(node) {
    node = selectNode(node);
    return getView(node.dataset[DATA_ATTRIBUTE]);
}