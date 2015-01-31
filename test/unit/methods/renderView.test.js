describe('methods/renderView', function () {
    'use strict';

    var assert = chai.assert,
        domFixture;

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    it('generates a unique ID with a prefix', function () {
        var view = wig.test.viewFixtureFactory('a');
        view.getNode.returns(document.createElement('div'));

        wig.renderView(view, domFixture);

        assert.ok(view.paint.calledOnce);
        assert.ok(view.notifyAttach.calledOnce);
    });
});