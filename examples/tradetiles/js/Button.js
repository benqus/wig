(function () {
    'use strict';

    TradingApp.Button = wig.View.extend({

        tagName: 'button',

        className: 'Button',

        template: [
            '<span class="action">{{ action }}</span>',
            '<sub>{{ priceParts.sub }}</sub>',
            '<strong>{{ priceParts.mid }}</strong>',
            '<sup>{{ priceParts.sup }}</sup>'
        ],

        events: {
            click: function () {
                //alert(this.get('price'));
            }
        },

        getCSSClass: function () {
            return this.get('color');
        },

        onAttach: function () {
            this.timeout = setTimeout(this.updatePrice.bind(this), 500 + Math.random() * 500);
        },

        onDetach: function () {
            clearTimeout(this.timeout);
        },

        parseAttributes: function (newAttrs) {
            var oldPrice = parseFloat(this.get('price')),
                price = newAttrs.price.toFixed(5).toString(),
                dot = price.indexOf('.');

            return {
                color: (!oldPrice || oldPrice < newAttrs.price ? 'green' : 'red'),
                priceParts: {
                    sub: price.substring(0, dot),
                    mid: price.substr(dot + 1, 2),
                    sup: price.substr(dot + 3)
                }
            };
        },

        updatePrice: function () {
            this.update({
                price: Math.abs(this.get('price') + Math.random() - Math.random())
            });
        }
    });
}());