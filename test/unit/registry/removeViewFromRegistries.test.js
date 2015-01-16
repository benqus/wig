describe('registry/removeViewFromRegistries', function () {
    "use strict";

    var assert = chai.assert,
        viewFixtureFactory = wig.test.viewFixtureFactory;

    afterEach(function () {
        wig.ViewRegistry.empty();
    });

    it('view and parent', function () {
        var childID = 'child',
            parentID = 'parent',
            childView = viewFixtureFactory(childID),
            parentView = viewFixtureFactory(parentID);

        wig.addViewToRegistries(childView, parentView);
        wig.removeViewFromRegistries(childView);

        assert.notOk(wig.ViewRegistry.get(childID));
    });
});