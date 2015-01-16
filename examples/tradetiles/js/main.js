(function () {
    'use strict';

    window.onload = function () {
        var domRoot = document.getElementById('trade-app'),
            button = new TradingApp.TileManager({
                attributes: {
                    currencies: [
                        'GBPUSD',
                        'GBPEUR',
                        'GBPHUF'
                    ]
                }
            });

        wig.renderView(button, domRoot);
    };

}());