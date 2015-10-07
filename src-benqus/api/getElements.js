/**
 * Method finds elements by a CSS selector.
 * Introduce custom DOM query by override.
 * @param   {Element} element
 * @param   {string}  selector
 * @returns {Element}
 */
api.getElements = function (element, selector) {
    return (selector ? element.querySelectorAll(selector) : element);
};