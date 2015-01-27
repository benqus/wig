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

        // ///////// //
        // overrides //
        // ///////// //

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
            var oldPrice = parseInt(this.get('price')),
                priceStr = newContext.price.toFixed(5).toString(),
                endOfBold = priceStr.indexOf('.') + 3;

            return {
                price: newContext.price,
                action: newContext.action,
                color: (!oldPrice || oldPrice < newContext.price ? 'green' : 'red'),
                boldPrice: priceStr.substring(0, endOfBold),
                lightPrice: priceStr.substr(endOfBold)
            };
        },

        // ////// //
        // custom //
        // ////// //

        updatePrice: function () {
            this.update({
                price: Math.abs(this.get('price') + Math.random() - Math.random())
            });
        }
    });
}());