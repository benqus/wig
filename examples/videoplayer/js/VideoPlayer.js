var VideoPlayer = {
    base: {},

    initialize: function (domRoot) {
        var videoPlayer = new VideoPlayer.Player();

        wig.renderView(videoPlayer, domRoot);
    }
};