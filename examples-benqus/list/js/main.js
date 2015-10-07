(function () {
    'use strict';

    window.onload = function () {
        var domRoot = document.getElementById('list-app');
        App.initialize(App.List, domRoot);
    };

}());