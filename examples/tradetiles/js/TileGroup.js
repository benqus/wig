(function () {
    'use strict';

    TradingApp.TileManager = wig.View.extend({

        className: 'TileManager',

        template: [
            '<header>',
                '<select></select>',
            '</header>',
            '<section class="tiles"></section>'
        ],

        renderMap: {
            '*': '.tiles'
        },

        addTile: function (currency) {
            TradingApp.Tile.add({
                attributes: {
                    currency: currency
                }
            }, this);
        },

        render: function () {
            this.get('currencies').forEach(this.addTile, this);
        }

    });
}());