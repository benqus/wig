describe('methods/renderView', function () {
    'use strict';

    var assert = chai.assert;

    it('generates a unique ID with a prefix', function () {
        var view = wig.test.viewFixtureFactory('a'),
            node = document.getElementById('fixture');

        wig.renderView(view, node);

        assert.ok(view.setNode.calledOnce);
        assert.ok(view.setNode.calledWithExactly(node));
        assert.ok(view.paint.calledOnce);
        assert.ok(view.notifyAttach.calledOnce);
    });
});