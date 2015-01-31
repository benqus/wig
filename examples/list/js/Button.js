App.Button = wig.View.extend({
    tagName: 'button',

    className: 'Button',

    template: 'x',

    props: [
        'onClick'
    ],

    events: {
        click: function () {
            this.onClick();
        }
    }
});