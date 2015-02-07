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
            var todo = App.todos.get(this.get('todoID')),
                checked;

            todo.done = !todo.done;
            checked = this.getChecked(todo.done);

            this.update({
                checked: checked
            });
        }
    },

    expects: [
        'onRemove'
    ],

    defaults: {
        checked: ''
    },

    // ///////// //
    // overrides //
    // ///////// //

    getCSS: function () {
        return this.getChecked(this.get('done'));
    },

    render: function () {
        App.Button.add({
            id: 'remove',
            onClick: this.onRemove.bind(this, this.get('todoID'))
        }, this);
    },

    parseContext: function (newContext) {
        var todo = App.todos.get(newContext.todoID);

        return {
            todoID: newContext.todoID,
            title: todo.title,
            done: todo.done,
            checked: this.getChecked(todo.done)
        };
    },

    // ////// //
    // custom //
    // ////// //

    getChecked: function (done) {
        return (done ? 'checked' : '');
    }
});