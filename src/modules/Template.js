var Template = wig.Template = Class.extend({

    constructor: function (Compiler) {
        this.Compiler = Compiler;
    },

    compileTemplateForView: function (view) {
        var template = view.template,
            context = view.serialize();

        if (typeof template === 'function') {
            return view.template(context);
        }

        if (Array.isArray(template)) {
            template = template.join('');
        }

        return this.Compiler.compile(template, context);
    }
});