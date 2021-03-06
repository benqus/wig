describe('ViewManager', function () {
    'use strict';

    var assert = chai.assert;

    var viewFixtureFactory = wig.test.viewFixtureFactory;

    afterEach(function () {
        wig.env.ViewRegistry.empty();
    });

    describe('getParentView', function () {
        it('returns undefined if no parent is registered', function () {
            var viewId = 'a',
                view = viewFixtureFactory(viewId);

            assert.notOk(wig.env.ViewRegistry.getParentView(view));
        });

        it('returns parent view', function () {
            var childId = 'a',
                parentId = 'b',
                parent = viewFixtureFactory(parentId),
                child = viewFixtureFactory(childId, parentId);

            assert.equal(wig.env.ViewRegistry.getParentView(child), parent);
        });
    });

    describe('getView', function () {
        it('returns the registered view', function () {
            var id = 'a',
                view = wig.test.viewFixtureFactory(id);

            wig.env.ViewRegistry.set(id, {
                view: view
            });

            assert.equal(wig.env.ViewRegistry.getView(id), view);
        });
    });

    describe('getViewAtNode', function () {
        it('returns the view associated to an Element by it\'s data attribute', function () {
            var view = {},
                id = 'a',
                div = document.createElement('div');

            div.dataset[wig.env.DATA_ATTRIBUTE] = id;
            wig.env.ViewRegistry.set(id, {
                view: view
            });

            assert.equal(wig.env.ViewManager.getViewAtNode(div), view);
        });
    });

    describe('destroyViewAtNode', function () {
        it('destroys the view associated to an Element by it\'s data attribute', function () {
            var id = 'a',
                view = wig.test.viewFixtureFactory(id),
                div = document.createElement('div');

            div.dataset[wig.env.DATA_ATTRIBUTE] = id;

            wig.env.ViewManager.destroyViewAtNode(div);

            assert.ok(view.remove.calledOnce);
        });
    });
});