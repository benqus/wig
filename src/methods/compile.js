/**
 * Method compiles a template with a context object.
 * Introduce custom template compilation by override.
 * @param   {string} template
 * @param   {object} context
 * @returns {String}
 */
wig.compile = function (template, context) {
    return env.Compiler.compile(template, context);
};