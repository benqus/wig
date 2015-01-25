(function () {
    'use strict';

    TradingApp.Button = wig.View.extend({
        tagName: 'button',
        className: 'Button',
        events: {
            click: function () {
                debugger;
                this.invoke('onClick');
            }
        }
    });
}());