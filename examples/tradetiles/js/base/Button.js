(function () {
    'use strict';

    TradingApp.base.Button = wig.View.extend({
        tagName: 'button',
        className: 'Button',

        props: {
            onClick: true
        },

        events: {
            click: 'onClick'
        },

        render: function () {
            var html = this.get('html');
            if (html) {
                this.getNode().innerHTML = html;
            }
        }
    });
}());