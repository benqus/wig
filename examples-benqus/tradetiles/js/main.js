(function () {
    'use strict';

    window.onload = function () {
        var domRoot = document.getElementById('trade-app');
        TradingApp.initialize(domRoot);
    };

}());