/**
 * Finds an element in the provided root HTMLElement.
 *
 * Override `wig.getElement`  if custom logic needed!
 *
 * @param   {string|HTMLElement} root     - Node or selector to search in
 * @param   {string}             selector - CSS selector
 * @returns {HTMLElement}
 */
function getElement(root, selector) {
    root = selectNode(root);
    return root.querySelector(selector);
}