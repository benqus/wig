App.Item = wig.View.extend({
    tagName: 'li',

    className: 'Item',

    template: [
        '<span>',
            '<input type="checkbox" {{ checked }} />',
        '</span>',
        '<span>{{ title }}</span>'
    ],

    events: {
        click: function () {
            this.update({
                done: !this.get('done')
            });
        }
    },

    defaults: {
        checked: ''
    },

    getCSS: function () {
        return this.getChecked(this.get('done'));
    },

    render: function () {
        App.Button.add({
            id: 'remove',
            onClick: this.remove.bind(this)
        }, this);
    },

    parseContext: function (newContext) {
        return {
            checked: this.getChecked(newContext.done)
        };
    },

    getChecked: function (done) {
        return (done ? 'checked' : '');
    }
});