var Template = {

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
                result = '';
            }

            return result;
        });
    },

    compileTemplateForView: function (view) {
        var template = view.template,
            markup;

        if (Array.isArray(template)) {
            template = template.join('');
        } else if (typeof template === 'function') {
            template = view.template();
        }

        markup = this.compile(template, view.attributes, view);

        return markup;
    }
};

wig.Template = Template;