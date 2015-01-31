describe('View.Registry', function () {
    "use strict";

    var assert = chai.assert;

    var viewFixtureFactory = wig.test.viewFixtureFactory;

    afterEach(function () {
        wig.View.Registry.empty();
    });

    it('is a Registry', function () {
        assert.ok(wig.View.Registry instanceof wig.Registry);
    });

    it('registers a view only', function () {
        var viewID = 'view',
            view = viewFixtureFactory(viewID);

        wig.View.registerView(view);

        assert.ok(wig.View.Registry.get(viewID));
        assert.equal(wig.View.Registry.get(viewID).view, view);
        assert.notOk(wig.View.Registry.get(viewID).parent);
    });

    it('view only', function () {
        var viewID = 'view',
            view = viewFixtureFactory(viewID);

        wig.View.registerView(view);

        assert.ok(wig.View.Registry.get(viewID));
        assert.equal(wig.View.Registry.get(viewID).view, view);
        assert.notOk(wig.View.Registry.get(viewID).parent);
    });

    it('view and parent', function () {
        var childID = 'child',
            parentID = 'parent',
            childView = viewFixtureFactory(childID),
            parentView = viewFixtureFactory(parentID);

        wig.View.registerView(childView, parentView);

        assert.ok(wig.View.Registry.get(childID).parent, parentID);
    });

    it('view and parent', function () {
        var childID = 'child',
            parentID = 'parent',
            childView = viewFixtureFactory(childID),
            parentView = viewFixtureFactory(parentID);

        wig.View.registerView(childView, parentView);
        wig.View.removeView(childView);

        assert.notOk(wig.View.Registry.get(childID));
    });
});