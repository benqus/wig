var App = {

    todos: new wig.Registry(),

    createTodo: (function () {
        var i = 0;
        return function (todo) {
            var id =  ('todo' + i++);
            this.todos.set(id, todo);
        };
    }()),

    initialize: function (List, domRoot) {
        var list;

        this.createTodo({title: 'abc', done: false});
        this.createTodo({title: 'bcd', done: false});
        this.createTodo({title: 'cde', done: true});
        this.createTodo({title: 'def', done: true});
        this.createTodo({title: 'efg', done: false});

        list = new List();

        wig.renderView(list, domRoot);
    }
};