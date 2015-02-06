(function () {
    'use strict';

    VideoPlayer.Video = wig.View.extend({
        tagName: 'video',

        className: 'Video',

        props: {
            onProgress: true
        },

        defaults: {
            width: 360,
            height: 240,
            source: ''
        },

        template: '<source src="{{ source }}" type="{{ type }}" />',

        events: {
            progress: function () {
                var node = this.getNode();
                this.onProgress(node.currentTime);
            }
        },

        onAttach: function () {
            var node = this.getNode();

            this.delegate('progress');

            node.width = this.get('width');
            node.height = this.get('height');
        },

        play: function () {
            this.getNode()
                .play();
        },

        pause: function (node) {
            node = (node || this.getNode());
            node.pause();
        },

        stop: function () {
            var node = this.getNode();
            this.pause(node);
            node.currentTime = 0;
        }
    });

}());