var Environment = wig.module.Environment = Class.extend({
    // wig View data attribute
    DATA_ATTRIBUTE: DATA_ATTRIBUTE,

    // initialize wig
    constructor: function () {
        this.dom          = new DOM();
        this.insurer      = new Insurer();
        this.compiler     = new Compiler();
        this.selection    = new Selection(this.dom);
        this.viewHelper   = new ViewHelper();
        this.viewRegistry = new ViewRegistry();

        this.viewManager = new ViewManager(this.viewHelper,
            this.viewRegistry, this.dom, this.selection);

        this.uiEventProxy = new UIEventProxy(
            this.viewHelper, this.dom, this.viewManager);

        this.initialize();
    },

    initialize: function () {
        this.viewHelper.setEnv(this.viewManager,
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