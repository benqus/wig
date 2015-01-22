var App = {
    initialize: function (List, domRoot) {
        var list = new List({
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
    }
};