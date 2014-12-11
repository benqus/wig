/**
 * Returns a DOM element based on a selector or the element itself.
 * @param   {string|HTMLElement} element
 * @returns {*}
 */
function selectNode(element) {
    if (typeof element === 'string') {
        element = wig.getElement(document.body, element);
    }

    return element;
}