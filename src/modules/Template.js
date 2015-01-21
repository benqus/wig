var Template = wig.Template = Class.extend({

    REGEXP: /\{\{\s*([\w\d\.]+)\s*\}\}/g,

    compile: function (template, context, view) {
        return template.replace(this.REGEXP, function (res) {
            var path = res.match(/[\w\d]+/g),
                attribute = path[0],
                ctx = (context[attribute] != null ? context : view),
                result;

            if (path.length > 1) {
                attribute = path.pop();
                while (path.length > 0) {
                    ctx = ctx[path.shift()];
                }
            }

            if (typeof ctx[attribute] === 'function') {
                return ctx[attribute](context);
            }

            result = ctx[attribute];

            if (typeof result === 'undefined') {
                result = res;
            }

            return result;
        });
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

        return this.compile(template, context, view);
    }
});