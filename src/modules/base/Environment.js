var Environment = wig.module.Environment = Class.extend({
    // wig View data attribute
    DATA_ATTRIBUTE: DATA_ATTRIBUTE,

    // initialize wig
    constructor: function () {
        this.dom = new DOM();
        this.insurer = new Insurer();
        this.compiler = new Compiler();
        this.viewRegistry = new ViewRegistry();

        this.selection = new Selection(this.dom);

        this.viewManager = new ViewManager(
            this.viewRegistry, this.dom, this.selection);

        this.uiEventProxy = new UIEventProxy(
            this.dom, this.viewManager);

        this.viewHelper = new ViewHelper(this.viewManager,
            this.uiEventProxy, this.dom, this.insurer);
    },

    /**
     * Generates a new unique string based on the
     * provided prefix and the latest Id.
     * @param   {string} prefix
     * @returns {string}
     */
    generateID :function (prefix) {
        return ((prefix || 0) + Id++);
    }
});