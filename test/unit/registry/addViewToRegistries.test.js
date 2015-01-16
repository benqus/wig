describe('registry/addViewToRegistries', function () {
    "use strict";

    var assert = chai.assert;

    var viewFixtureFactory = wig.test.viewFixtureFactory;

    afterEach(function () {
        wig.ViewRegistry.empty();
    });

    it('view only', function () {
        var viewID = 'view',
            view = viewFixtureFactory(viewID);

        wig.addViewToRegistries(view);

        assert.ok(wig.ViewRegistry.get(viewID));
        assert.equal(wig.ViewRegistry.get(viewID).view, view);
        assert.notOk(wig.ViewRegistry.get(viewID).parent);
    });

    it('view and parent', function () {
        var childID = 'child',
            parentID = 'parent',
            childView = viewFixtureFactory(childID),
            parentView = viewFixtureFactory(parentID);

        wig.addViewToRegistries(childView, parentView);

        assert.ok(wig.ViewRegistry.get(childID).parent, parentID);
    });
});