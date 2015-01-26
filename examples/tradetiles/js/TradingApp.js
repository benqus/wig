var TradingApp = {
    base: {},

    initialize: function (domRoot) {
        var tileGroup = new TradingApp.TileGroup({
            context: {
                selected: [
                    'gbpusd',
                    'gbpeur',
                    'eurusd',
                    'eurhuf',
                    'usdeur',
                    'hufeur',
                    'usdgbp'
                ],
                currencies: {
                    gbpusd: {name: 'GBPUSD', value: 'gbpusd'},
                    gbpeur: {name: 'GBPEUR', value: 'gbpeur'},
                    gbphuf: {name: 'GBPHUF', value: 'gbphuf'},
                    usdgbp: {name: 'USDGBP', value: 'usdgbp'},
                    usdeur: {name: 'USDEUR', value: 'usdeur'},
                    usdhuf: {name: 'USDHUF', value: 'usdhuf'},
                    eurgbp: {name: 'EURGBP', value: 'eurgbp'},
                    eurusd: {name: 'EURUSD', value: 'eurusd'},
                    eurhuf: {name: 'EURHUF', value: 'eurhuf'},
                    hufgbp: {name: 'HUFGBP', value: 'hufgbp'},
                    hufusd: {name: 'HUFUSD', value: 'hufusd'},
                    hufeur: {name: 'HUFEUR', value: 'hufeur'}
                }
            }
        });

        wig.renderView(tileGroup, domRoot);
    }
};