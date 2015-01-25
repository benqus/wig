(function () {
    'use strict';

    TradingApp.Tile = wig.View.extend({
        tagName: 'article',
        className: 'Tile',

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
            '<section class="buttons"></section>',
            '<section>',
                '<input type="text" class="amount" value="{{ amount }}" />',
            '</section>'
        ],

        renderMap: {
            '*': '.buttons',
            'close': '.header'
        },

        View: TradingApp.PriceButton,

        onAttach: function () {
            this.delegate('focus', '.amount');
        },

        render: function () {
            this.addButton('buyButton', 'buy', 1.54987);
            this.addButton('sellButton', 'sell', 1.45789);

            TradingApp.base.Button
                .add({
                    id: 'close',
                    cssClass: 'fa fa-close close',
                    callbacks: {
                        onClick: this.onClick.bind(this)
                    }
                }, this);
        },

        onClick: function () {
            this.invoke('onRemove', this.get('value'));
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