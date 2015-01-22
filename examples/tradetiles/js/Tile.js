(function () {
    'use strict';

    TradingApp.Tile = wig.View.extend({

        className: 'Tile',

        defaults: {
            amount: 0
        },

        events: {
            click: function (event) {
                if (event.target.tagName === 'H1') {
                    this.update();
                }
            },

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
            '<header>',
                '<h1>{{ currency }}</h1>',
            '</header>',
            '<article class="buttons"></article>',
            '<article>',
                '<input type="text" class="amount" value="{{ amount }}" />',
            '</article>'
        ],

        renderMap: {
            '*': '.buttons'
        },

        View: TradingApp.Button,

        onAttach: function () {
            this.delegate('focus', '.amount');
        },

        render: function () {
            this.addButton('buyButton', 'buy', 1.54987);
            this.addButton('sellButton', 'sell', 1.45789);
        },

        addButton: function (id, action, price) {
            this.addView({
                id: id,
                attributes: {
                    price: price,
                    action: action
                }
            });
        }

    });
}());