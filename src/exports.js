extend(wig, {
    View: View,
    extend: extend,
    ViewRegistry: ViewRegistry,
    renderView: renderView,
    getView: getView,

    // Hook
    getElement: getElement,

    getViewAtNode: getViewAtNode,
    setViewAttribute: setViewAttribute,
    attachNodeToParent: attachNodeToParent,
    selectNode: selectNode,
    destroyViewAtNode: destroyViewAtNode
});