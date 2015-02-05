// initialize wig
wig.init = function () {
    wig.env.dom = new DOM();
    wig.env.insurer = new Insurer();
    wig.env.compiler = new Compiler();
    wig.env.selection = new Selection(wig.env.dom);

    wig.env.viewManager = new ViewManager(
        View.Registry, wig.env.dom, wig.env.selection);

    wig.env.uiEventProxy = new UIEventProxy(
        wig.env.dom, wig.env.viewManager);
};