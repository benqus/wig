// initialize wig
wig.init = function () {
    env.dom = new DOM();
    env.insurer = new Insurer();
    env.compiler = new Compiler();
    env.selection = new Selection(env.dom);
    env.viewRegistry = new ViewRegistry();

    env.viewManager = new ViewManager(
        env.viewRegistry, env.dom, env.selection);

    env.uiEventProxy = new UIEventProxy(
        env.dom, env.viewManager);

    env.viewHelper = new ViewHelper(env.viewRegistry,
        env.viewManager, env.uiEventProxy, env.dom, env.insurer);
};