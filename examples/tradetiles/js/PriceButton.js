(function () {
    'use strict';

    TradingApp.PriceButton = TradingApp.base.Button.extend({
        className: 'PriceButton',

        template: [
            '<span class="action">{{ action }}</span>',
            '<span class="price">',
                '<strong>{{ boldPrice }}</strong>',
                '<sup>{{ lightPrice }}</sup>',
            '</span>'
        ],

        getCSS: function () {
            return [this.get('color'), this.get('action')].join(' ');
        },

        onAttach: function () {
            this.timeout = setTimeout(this.updatePrice.bind(this), 500 + Math.random() * 1500);
        },

        onDetach: function () {
            clearTimeout(this.timeout);
        },

        parseContext: function (newContext) {
            var oldPrice = parseFloat(this.get('price')),
                price = newContext.price.toFixed(5).toString(),
                endofBold = price.indexOf('.') + 3;

            return {
                color: (!oldPrice || oldPrice < newContext.price ? 'green' : 'red'),
                boldPrice: price.substring(0, endofBold),
                lightPrice: price.substr(endofBold)
            };
        },

        updatePrice: function () {
            this.update({
                price: Math.abs(this.get('price') + Math.random() - Math.random())
            });
        }
    });
}());