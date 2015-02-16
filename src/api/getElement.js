/**
 * Method finds an element by a CSS selector.
 * Introduce custom DOM query by override.
 * @param   {Element} element
 * @param   {string}  selector
 * @returns {Element}
 */
api.getElement = function (element, selector) {
    return (selector ? element.querySelector(selector) : element);
};