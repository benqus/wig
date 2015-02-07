/*
 * @namespace
 * user overrides to introduce backwards compatibility or custom templating
 */
extend(env, {

    /**
     * Method compiles a template with a context object.
     * If selector is empty or not defined it will return the original node
     * Introduce custom DOM query by override.
     * @param   {Element} element
     * @param   {string}  selector
     * @returns {Element}
     */
    getElement: function (element, selector) {
        return (selector ? element.querySelector(selector) : element);
    },

    /**
     * Method returns the currently active Element in the DOM.
     * Override method for older browser support.
     * @returns {Element}
     */
    getFocusedElement: function () {
        return document.activeElement;
    },

    /**
     * Method compiles a template with a context object.
     * Introduce custom template compilation by override.
     * @param   {string} template
     * @param   {object} context
     * @returns {String}
     */
    compile: function (template, context) {
        return env.compiler.compile(template, context);
    }
});