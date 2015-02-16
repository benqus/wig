/**
 * Method returns the currently active Element in the DOM.
 * Override method for older browser support.
 * @returns {Element}
 */
api.getFocusedElement = function () {
    return document.activeElement;
};