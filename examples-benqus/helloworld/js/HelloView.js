(function () {
    'use strict';

    // create a new View class
    var HelloView = wig.View.extend({
        tagName: 'h1',
        className: 'HelloView',
        defaults: {
            name: 'somebody'
        },
        template: 'Hello {{ name }}!'
    });

    // instantiate a new View instance with a context
    var view = new HelloView({
        name: 'Doug'
    });

    window.onload = function () {
        // render the View instance
        wig.renderView(view, document.body);
    };
}());