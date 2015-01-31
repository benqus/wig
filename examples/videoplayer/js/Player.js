(function () {
    'use strict';

    VideoPlayer.Player = wig.View.extend({
        className: 'Player',

        template: [
            '<section class="video"></section>',
            '<section class="progress"></section>',
            '<section class="controls"></section>'
        ],

        renderMap: {
            'video': '.video',
            '*': '.controls'
        },

        render: function () {
            var source = 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/0_c0r624gh/flavorId/0_w48dtkyq/format/url/protocol/http/a.mp4';

            VideoPlayer.Video
                .add({
                    id: 'video',
                    source: source,
                    type: 'video/mp4',
                    onProgress: this.updateProgress.bind(this)
                }, this);

            VideoPlayer.base.Paragraph
                .add({
                    id: 'progress',
                    text: ''
                }, this);

            this.addControlButton('fa fa-play', this.playVideo);
            this.addControlButton('fa fa-pause', this.pauseVideo);
        },

        addControlButton: function (cssClass, callback) {
            VideoPlayer.base.Button
                .add({
                    css: cssClass,
                    onClick: callback.bind(this)
                }, this);
        },

        updateProgress: function (currentTime) {
            this.getView('progress')
                .update({
                    text: parseInt(currentTime || 0)
                });
        },

        playVideo: function () {
            this.getView('video')
                .play();
        },

        pauseVideo: function () {
            this.getView('video')
                .pause();
        }
    });
}());