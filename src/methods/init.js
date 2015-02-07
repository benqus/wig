// initialize wig
wig.env.init = function () {
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
};