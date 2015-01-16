(function () {
    "use strict";

    var onload = window.onload;

    mocha.setup('bdd');

    window.onload = function () {
        if (typeof onload === 'function') {
            onload();
        }

        mocha.run();
    };
}());