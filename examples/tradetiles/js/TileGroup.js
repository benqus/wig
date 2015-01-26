(function () {
    'use strict';

    TradingApp.TileGroup = wig.View.extend({
        tagName: 'section',
        className: 'TileGroup',

        template: [
            '<header class="currency-selector"></header>',
            '<section class="tiles"></section>'
        ],

        renderMap: {
            '*': '.tiles',
            'currencySelector': '.currency-selector'
        },

        render: function () {
            var selected = this.get('selected'),
                currencies = this.get('currencies'),
                options = ['Add new currency...'],
                tiles = [],
                i;

            // render currencies in a trading tile or into the select's options
            for (i in currencies) {
                // if currency is selected
                if (selected.indexOf(currencies[i].value) > -1) {
                    tiles.push(currencies[i]);
                } else {
                    options.push(currencies[i]);
                }
            }

            this.addCurrencySelector(options);

            selected.forEach(function (currency) {
                this.addTile(currencies[currency]);
            }, this);

            this.addNewPlaceholderTile();
        },

        addTile: function (currency) {
            var options = wig.extend({}, currency, {
                id: currency.value,
                onRemove: this.removeTile.bind(this)
            });

            TradingApp.Tile
                .add(options, this);
        },

        addCurrencySelector: function (options) {
            TradingApp.base.Select
                .add({
                    id: 'currencySelector',
                    css: 'currency-select',
                    options: options,
                    onChange: this.selectCurrency.bind(this)
                }, this);
        },

        addNewPlaceholderTile: function () {
            TradingApp.base.Button
                .add({
                    css: 'add-tile',
                    html:
                        '<span class="add-tile-btn">' +
                            '<span class="">Add currency</span>' +
                            '<span class="fa fa-plus icon"></span>' +
                        '</span>'
                }, this);
        },

        selectCurrency: function (currency) {
            var selected = this.get('selected');
            selected.push(currency);

            this.update({
                selected: selected
            });
        },

        removeTile: function (currency) {
            var selected = this.get('selected'),
                index = selected.indexOf(currency);

            if (index > -1) {
                selected.splice(index, 1);
            }

            this.update({
                selected: selected
            });
        }
    });
}());