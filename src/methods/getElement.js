/**
 * Method compiles a template with a context object.
 * If selector is empty or not defined it will return the original node
 * Introduce custom DOM query by override.
 * @param   {Element} element
 * @param   {string}  selector
 * @returns {Element}
 */
wig.getElement = function (element, selector) {
    return (selector ? element.querySelector(selector) : element);
};