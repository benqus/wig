App.Button = wig.View.extend({
    tagName: 'button',

    className: 'Button',

    template: 'x',

    expects: [
        'onClick'
    ],

    events: {
        click: function () {
            this.onClick();
        }
    }
});