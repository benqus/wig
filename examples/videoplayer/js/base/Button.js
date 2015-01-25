(function () {
    'use strict';

    VideoPlayer.base.Button = wig.View.extend({
        tagName: 'button',
        className: 'Button',

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