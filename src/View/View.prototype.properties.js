extend(View.prototype, {
    /**
     * @type {string}
     */
    tagName: 'div',

    /**
     * @type {string}
     */
    className: 'View',

    /**
     * @type {object}
     */
    defaults: {},

    /**
     * @type {object}
     */
    renderMap: {},

    /**
     * @type {object}
     */
    dataMap: {},

    /**
     * @type {object}
     */
    events: {},

    /**
     * @type {View}
     */
    View: View,

    /**
     * @type {object|string[]}
     */
    props: {},

    /**
     * @type {string|string[]|function}
     */
    template: ''
});