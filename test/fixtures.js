(function () {
    "use strict";

    function createViewFixture(viewID) {
        return {
            getID: sinon.stub().returns(viewID),
            hasEvent: sinon.stub(),
            fireDOMEvent: sinon.stub(),
            remove: sinon.stub(),
            getSelectorForChild: sinon.stub(),
            getNode: sinon.stub(),
            setNode: sinon.stub(),
            paint: sinon.stub(),
            onAttach: sinon.stub(),
            onDetach: sinon.stub(),
            empty: sinon.stub(),
            render: sinon.stub()
        };
    }

    wig.test = {
        // creates a view fixture object
        viewFixtureFactory: function (viewID, parent) {
            var view = createViewFixture(viewID);

            if (parent) {
                if (typeof parent === 'string') {
                    parent = createViewFixture(parent);
                }
            }

            wig.View.registerView(view, parent);

            return view;
        },

        click: function (el){
            var event = document.createEvent("MouseEvent");
            event.initMouseEvent(
                "click",
                true /* bubble */,
                true /* cancelable */,
                window, null,
                0, 0, 0, 0, /* coordinates */
                false, false, false, false, /* modifier keys */
                0 /*left*/,
                null
            );
            el.dispatchEvent(event);
            return event;
        },

        findClosestViewNodeStubFactory: function (viewID) {
            var stub = sinon.stub(wig.env.dom, 'findClosestViewNode');
                stub.returns(viewID);

            return stub;
        }
    };
}());