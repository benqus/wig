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

    getCSSClass: function () {
        return this.getChecked(this.get('done'));
    },

    render: function () {
        App.Button.add({
            id: 'remove',
            callbacks: {
                remove: this.remove.bind(this)
            }
        }, this);
    },

    parseContext: function (newAttributes) {
        return {
            checked: this.getChecked(newAttributes.done)
        };
    },

    getChecked: function (done) {
        return (done ? 'checked' : '');
    }
});