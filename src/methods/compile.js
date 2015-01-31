/**
 * Method compiles a template with a context object
 * @param {string} template
 * @param {object} context
 * @returns {String}
 */
wig.compile = function (template, context) {
    return wig.env.compiler.compile(template, context);
};