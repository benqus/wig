App.List = wig.View.extend({

    className: 'List',

    defaults: {
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
        App.todos.each(this.addItem, this);
    },

    addItem: function (id) {
        App.Item
            .add({
                id: id,
                todoID: id,
                onRemove: this.removeItem.bind(this, id)
            }, this);
    },

    removeItem: function (todoId) {
        App.todos.unset(todoId);
        this.removeView(todoId);
    },

    createItem: function (title) {
        App.createTodo({
            title: title,
            done: false
        });

        this.update();
    }
});