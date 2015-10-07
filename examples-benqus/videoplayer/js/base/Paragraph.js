(function () {
    'use strict';

    VideoPlayer.base.Paragraph = wig.View.extend({
        tagName: 'p',
        className: 'Paragraph',
        template: '{{ text }}'
    });
}());