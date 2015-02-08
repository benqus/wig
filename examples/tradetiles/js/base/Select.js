(function () {
    'use strict';

    TradingApp.base.Select = wig.View.extend({
        tagName: 'select',

        className: 'Select',

        expects: [
            'onChange'
        ],

        defaults: {
            options: []
        },

        events: {
            change: function () {
                this.onChange(this.node.value);
            }
        },

        render: function () {
            var options = this.get('options'),
                selected = this.get('selected'),
                node = this.getNode();

            node.innerHTML = options.map(this.addOption, this);

            if (selected) {
                node.value = selected;
            }
        },

        addOption: function (option, index) {
            var type = typeof option,
                value = index,
                name;

            if (option) {
                if (type === 'object') {
                    name = option.name;

                    if (option.value) {
                        value = option.value;
                    }
                } else if (type === 'string') {
                    name = option;
                }
            }

            return wig.compile('<option value="{{ value }}">{{ name }}</option>', {
                name: name,
                value: value
            });
        }
    });

}());