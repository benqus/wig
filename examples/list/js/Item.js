App.Item = wig.View.extend({
    tagName: 'li',

    className: 'Item',

    template: [
        '<span>',
            '<input type="checkbox" {{ getChecked }} />',
        '</span>',
        '<span>{{ title }}</span>',
        '<span class="button-wrapper"></span>'
    ],

    renderMap: {
        'remove': '.button-wrapper'
    },

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

    getChecked: function () {
        if (this.get('done')) {
            return 'checked';
        }
    },

    render: function () {
        App.Button.add({
            id: 'remove',
            callbacks: {
                remove: this.remove.bind(this)
            }
        }, this);
    }
});