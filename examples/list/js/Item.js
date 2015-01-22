App.Item = wig.View.extend({
    className: 'Item',

    template: '<li>{{ title }}<button class="remove">x</button></li>',

    events: {
        click: 'remove'
    }
});