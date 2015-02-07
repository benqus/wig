(function () {
    'use strict';

    var DatePicker = wig.View.extend({
        tagName: 'div',
        className: 'DatePicker',
        template: '<h1>Please select a date:</h1>',

        onAttach: function () {
            $(this.getNode()).datepicker();
        },

        onDetach: function () {
            $(this.getNode()).datepicker('destroy');
        }
    });

    // instantiate a new View instance with a context
    var view = new DatePicker();

    window.onload = function () {
        // render the View instance
        wig.renderView(view, document.body);
        view.update();
    };
}());