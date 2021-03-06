describe('UIEventProxy', function () {

    var assert = chai.assert,
        UIEventProxy = wig.module.UIEventProxy;

    // fixtures
    var viewFixtureFactory = wig.test.viewFixtureFactory,
        findClosestViewNodeStubFactory = wig.test.findClosestViewNodeStubFactory;

    it('exists', function () {
        assert.ok(wig.env.UIEventProxy);
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


        wig.env.UIEventProxy.listener(event);

        assert.ok(find.calledOnce);
        assert.ok(find.calledWithExactly(target, 'data-' + wig.env.DATA_ATTRIBUTE));

        // restore and reset stubs
        find.restore();
    });

    it('starts listening to [eventType] DOM events only once with one shared listener', function () {
        var addEventListenerStub = sinon.stub(document, 'addEventListener'),
            eventType = 'click';

        wig.env.UIEventProxy.startListenTo(eventType);
        wig.env.UIEventProxy.startListenTo(eventType);

        assert.ok(addEventListenerStub.calledOnce);
        assert.ok(addEventListenerStub.calledWithExactly(eventType, wig.env.UIEventProxy.listener));
        assert.ok(wig.env.UIEventProxy.isListeningTo(eventType));

        addEventListenerStub.restore();
    });

    it('removes listener for [eventType] DOM event', function () {
        var addEventListenerStub = sinon.stub(document, 'addEventListener'),
            removeEventListenerStub = sinon.stub(document, 'removeEventListener'),
            eventType = 'click';

        wig.env.UIEventProxy.stopListenTo(eventType);

        assert.ok(removeEventListenerStub.calledOnce);
        assert.ok(removeEventListenerStub.calledWithExactly(eventType, wig.env.UIEventProxy.listener));
        assert.notOk(wig.env.UIEventProxy.isListeningTo(eventType));

        addEventListenerStub.restore();
    });

    it('DOM events fire up', function (done) {
        var target = document.getElementById('fixture'),
            proxy;

        var listenerStub = sinon.stub(UIEventProxy.prototype, 'listener', function (evt) {
            assert.equal(evt.type, 'click');
            assert.equal(evt.target, target);

            listenerStub.restore();
            done();
        });

        proxy = new UIEventProxy();
        proxy.startListenTo('click');

        assert.ok(proxy.isListeningTo('click'));

        wig.test.click(target);
    });

});