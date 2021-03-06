(function () {
    'use strict';

    TradingApp.Tile = wig.View.extend({
        tagName: 'article',
        className: 'Tile',

        expects: {
            onRemove: true
        },

        defaults: {
            amount: 0
        },

        events: {
            keyup: function (event) {
                var amount = parseInt(event.target.value);

                if (!isNaN(amount) && amount !== this.get('amount')) {
                    this.update({
                        amount: amount
                    });
                }
            }
        },

        template: [
            '<header class="header">',
                '<h1 class="title">{{ name }}</h1>',
            '</header>',
            '<section>',
                '<input type="text" class="amount" value="{{ amount }}" />',
            '</section>',
            '<section class="buttons"></section>'
        ],

        renderMap: {
            '*': '.buttons',
            'close': '.header'
        },

        View: TradingApp.PriceButton,

        // ///////// //
        // overrides //
        // ///////// //

        onAttach: function () {
            this.delegate('focus', '.amount');
        },

        render: function () {
            this.addButton('buyButton', 'buy', 1.54987);
            this.addButton('sellButton', 'sell', 1.45789);

            TradingApp.base.Button
                .add({
                    id: 'close',
                    css: 'fa fa-close close',
                    onClick: this.onClick.bind(this)
                }, this);
        },

        // ////// //
        // custom //
        // ////// //

        onClick: function () {
            this.onRemove(this.get('value'));
        },

        addButton: function (id, action, price) {
            this.addView({
                id: id,
                price: price,
                action: action
            });
        }

    });
}());