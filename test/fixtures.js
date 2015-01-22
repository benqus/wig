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
            empty: sinon.stub(),
            render: sinon.stub(),
            notifyAttach: sinon.stub(),
            notifyDetach: sinon.stub()
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

        viewRegistryFixtureFactory: function () {
            var viewRegistry = new wig.Registry();
            return sinon.stub(viewRegistry);
        },

        DOMFixtureFactory: function () {
            var dom = new wig.DOM();
            return sinon.stub(dom);
        },

        SelectionFixtureFactory: function () {
            var selection = new wig.Selection();
            return sinon.stub(selection);
        },

        findClosestViewNodeStubFactory: function (viewID) {
            var stub = sinon.stub(wig.env.dom, 'findClosestViewNode');
                stub.returns(viewID);

            return stub;
        }
    };
}());