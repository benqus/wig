(function () {
    'use strict';

    var Item = wig.View.extend({
        className: 'Item',

        template: '<li>{{ title }}<button class="remove">x</button></li>',

        events: {
            click: function () {
                this.remove();
            }
        }
    });

    var List = wig.View.extend({
        className: 'List',

        events: {
            keypress: function (e) {
                var titleNode = this.find('.title'),
                    title = titleNode.value;

                if (title && e.keyCode === 13) {
                    this.addItem({
                        title: title
                    });

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

        addItem: function (item) {
            Item.add({
                attributes: item
            }, this);
        },

        render: function () {
            var items = this.get('items');
            items.forEach(this.addItem, this);
        }

    });

    window.onload = function () {
        var domRoot = document.getElementById('list-app'),
            list = new List({
                attributes: {
                    items: [
                        {title: 'abc'},
                        {title: 'bcd'},
                        {title: 'cde'},
                        {title: 'def'},
                        {title: 'efg'}
                    ]
                }
            });

        wig.renderView(list, domRoot);
    };

}());