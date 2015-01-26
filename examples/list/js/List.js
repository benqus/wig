App.List = wig.View.extend({

    className: 'List',

    defaults: {
        items: [],
        title: ''
    },

    events: {
        keypress: function (e) {
            var titleNode = this.find('.title'),
                title = titleNode.value;

            if (title && e.keyCode === 13) {
                this.addItem(title);
                titleNode.value = '';
            }
        }
    },

    template: [
        '<ul class="list"></ul>',
        '<input class="title" value="{{ title }}" />'
    ],

    renderMap: {
        '*': '.list'
    },

    render: function () {
        var items = this.get('items');

        items.forEach(function (item) {
            App.Item.add(item, this);
        }, this);
    },

    addItem: function (title) {
        var items = this.get('items');
        items.push({
            title: title,
            done: false
        });

        this.update();
    }
});