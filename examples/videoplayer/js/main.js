(function () {
    'use strict';

    window.onload = function () {
        var domRoot = document.getElementById('video-player');
        VideoPlayer.initialize(domRoot);
    };
}());