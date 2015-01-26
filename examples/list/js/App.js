var App = {
    initialize: function (List, domRoot) {
        var list = new List({
                items: [
                    {title: 'abc', done: false},
                    {title: 'bcd', done: false},
                    {title: 'cde', done: true},
                    {title: 'def', done: true},
                    {title: 'efg', done: false}
                ]
            });

        wig.renderView(list, domRoot);
    }
};