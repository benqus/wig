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
                this.createItem(title);
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
            item = wig.extend({}, item, {
                onRemove: this.removeItem.bind(this, item)
            });

            App.Item.add(item, this);
        }, this);
    },

    removeItem: function (item, childViewID) {
        var items = this.get('items'),
            index = items.indexOf(item);

        items.splice(index, 1);
        this.removeView(childViewID);
    },

    createItem: function (title) {
        var items = this.get('items');
        items.push({
            title: title,
            done: false
        });

        this.update();
    }
});