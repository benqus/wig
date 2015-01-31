describe('UIEventProxy', function () {

    var assert = chai.assert,
        UIEventProxy = wig.UIEventProxy;

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