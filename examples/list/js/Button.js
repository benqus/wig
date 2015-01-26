App.Button = wig.View.extend({
    tagName: 'button',

    className: 'Button',

    template: 'x',

    props: {
        onClick: true
    },

    events: {
        click: function () {
            this.invoke('onClick');
        }
    }
});