App.Item = wig.View.extend({
    tagName: 'li',

    className: 'Item',

    template: [
        '<span>',
            '<input type="checkbox" {{ getChecked }} />',
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

    getCSSClass: function () {
        return this.getChecked();
    },

    render: function () {
        App.Button.add({
            id: 'remove',
            callbacks: {
                remove: this.remove.bind(this)
            }
        }, this);
    },

    getChecked: function () {
        if (this.get('done')) {
            return 'checked';
        }
    }
});