describe('UIEventProxy', function () {
    "use strict";

    var assert = chai.assert;

    // fixtures
    var viewFixtureFactory = wig.test.viewFixtureFactory,
        findClosestViewNodeStubFactory = wig.test.findClosestViewNodeStubFactory;

    afterEach(function () {
        wig.View.Registry.empty();
    });

    it('exists', function () {
        assert.ok(wig.env.uiEventProxy);
    });

    it('event listener searches for the closest DOM Element associated with a view ID' +
       ' and fires the DOM event on the View', function () {

        var viewID = 'a',
            view = viewFixtureFactory(viewID),
            find = findClosestViewNodeStubFactory(viewID),
            target = {},
            event = {
                target: target
            };

        view.hasEvent.returns(true);

        wig.env.uiEventProxy.listener(event);

        assert.ok(find.calledOnce);
        assert.ok(find.calledWithExactly(target, 'data-' + wig.DATA_ATTRIBUTE));
        assert.ok(view.fireDOMEvent.calledOnce);

        // restore and reset stubs
        find.restore();
    });

    it('starts listening to [eventType] DOM events only once with one shared listener', function () {
        var addEventListenerStub = sinon.stub(document, 'addEventListener'),
            eventType = 'click';

        wig.env.uiEventProxy.startListenTo(eventType);
        wig.env.uiEventProxy.startListenTo(eventType);

        assert.ok(addEventListenerStub.calledOnce);
        assert.ok(addEventListenerStub.calledWithExactly(eventType, wig.env.uiEventProxy.listener));
        assert.ok(wig.env.uiEventProxy.isListeningTo(eventType));

        addEventListenerStub.restore();
    });

    it('removes listener for [eventType] DOM event', function () {
        var addEventListenerStub = sinon.stub(document, 'addEventListener'),
            removeEventListenerStub = sinon.stub(document, 'removeEventListener'),
            eventType = 'click';

        wig.env.uiEventProxy.stopListenTo(eventType);

        assert.ok(removeEventListenerStub.calledOnce);
        assert.ok(removeEventListenerStub.calledWithExactly(eventType, wig.env.uiEventProxy.listener));
        assert.notOk(wig.env.uiEventProxy.isListeningTo(eventType));

        addEventListenerStub.restore();
    });

});