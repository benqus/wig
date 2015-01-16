// user defined methods defaulting to NoOp
[
    'onAttach',
    'onDetach',
    'onDestroy',
    'render'
].forEach(function (method) {
    View.prototype[method] = NoOp;
});