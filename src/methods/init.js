wig.init = function () {
    wig.env.dom = new DOM();
    wig.env.template = new Template();
    wig.env.selection = new Selection(wig.env.dom);
};