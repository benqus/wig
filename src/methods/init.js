// initialize wig
wig.init = function () {
    env.dom = new DOM();
    env.insurer = new Insurer();
    env.compiler = new Compiler();
    env.selection = new Selection(env.dom);

    env.viewManager = new ViewManager(
        View.Registry, env.dom, env.selection);

    env.viewHelper = new ViewHelper(env.viewManager);

    env.uiEventProxy = new UIEventProxy(
        env.dom, env.viewManager);
};