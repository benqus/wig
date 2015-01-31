/**
 * @class
 * @classdesc Compiles templates and caches them.
 */
var Compiler = wig.Compiler = Class.extend({

    start: '{{',
    end: '}}',

    constructor: function () {
        this.templateCache = new Registry();
        /**
         * RegExp to find the placeholders inside the templates.
         * @type {RegExp}
         */
        this.regExp = new RegExp(
            this.start + '\\s*[\\w\\d\\.]+\\s*' + this.end,
            'gim'
        );
    },

    /**
     * Memoizes a method for a placeholder to access attributes.
     * @param   {String} placeholder - eg: "{{ myPlaceholder }}"
     * @type    {Function}
     * @returns {Function}
     */
    compilerMethodFactory: function (placeholder) {
        var length = (placeholder.length - 2);
        var sanitized = placeholder.substring(2, length).trim().split(".");
        var l = sanitized.length;

        /**
         * Discovers the nested/attribute to fetch from attribute passed.
         * @param   {Object} map - attributes
         * @returns {String}
         */
        return function (map) {
            var result = map[sanitized[0]];
            var ns = map;
            var i = 0;

            // digging down the namespace
            if (l > 1) {
                while (ns && i < l) {
                    ns = ns[sanitized[i++]];
                }

                result = ns;
            }

            return result;
        };
    },

    /**
     * Generates a compiled, cache-able template to reuse.
     * @param   {String} text - eg: "hakuna {{ timon }} matata"
     * @type    {Function}
     * @returns {Array}
     */
    generateCompiledResult: function (text) {
        // placeholders to replace
        var placeholders = text.match(this.regExp);
        var i = 0;
        var splitText, compiledResults;

        if (placeholders) {
            // actual template content
            splitText = text.split(this.regExp);

            // precompiled array of content
            compiledResults = [];

            while (placeholders.length > 0) {
                compiledResults.push(
                    splitText[i],
                    this.compilerMethodFactory(placeholders.shift())
                );

                i += 1;
            }

            compiledResults.push(splitText[i]);

            this.templateCache.set(text, compiledResults);
        }

        return (this.templateCache.get(text) || text);
    },

    /**
     * Pre-compiles and caches the given template.
     * If attributes is defined, it will compile the template into a String.
     * @param   {String}  text   - eg: "hakuna {{ timon }} matata"
     * @param   {Object} [context] - context
     * @returns {String}
     */
    compile: function (text, context) {
        var compiledTemplate = this.templateCache.get(text);
        var markup = "";
        var item, i, l;

        if (!compiledTemplate) {
            compiledTemplate = this.generateCompiledResult(text);
        }

        // if a map of key-value pairs is provided, compile too
        if (context && typeof context === 'object') {
            for (i = 0, l = compiledTemplate.length; i < l; i++) {
                item = compiledTemplate[i];
                markup += (typeof item === 'function' ? item(context) : item);
            }
        }

        return markup;
    },

    /**
     * Returns the specified comiled markups.
     * @param   {String} template - eg: "hakuna {{ timon }} matata"
     * @returns {String}
     */
    getCompiled: function (template) {
        return this.templateCache.get(template);
    },

    /**
     * Disposes all previously compiled and cached markups.
     */
    disposeMarkups: function () {
        this.templateCache.empty();
    }

});