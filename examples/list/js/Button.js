App.Button = wig.View.extend({
    tagName: 'button',

    className: 'Button',

    template: 'x',

    events: {
        click: function () {
            this.invoke('remove');
        }
    }
});