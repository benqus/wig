var Environment = wig.module.Environment = Class.extend({
    // wig View data attribute
    DATA_ATTRIBUTE: DATA_ATTRIBUTE,

    // initialize wig
    constructor: function () {
        this.Dom          = new DOM();
        this.Insurer      = new Insurer();
        this.Compiler     = new Compiler();
        this.Selection    = new Selection(this.Dom);
        this.ViewHelper   = new ViewHelper();
        this.ViewRegistry = new ViewRegistry();

        this.ViewManager = new ViewManager(this.ViewHelper,
            this.ViewRegistry, this.Dom, this.Selection);

        this.UIEventProxy = new UIEventProxy(
            this.ViewHelper, this.Dom, this.ViewRegistry);

        this.initialize();
    },

    initialize: function () {
        this.ViewHelper.setEnv(this.ViewManager, this.ViewRegistry,
            this.UIEventProxy, this.Dom, this.Insurer);
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