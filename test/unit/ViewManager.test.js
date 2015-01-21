describe('ViewManager', function () {
    'use strict';

    var assert = chai.assert;

    var viewFixtureFactory = wig.test.viewFixtureFactory;

    afterEach(function () {
        wig.View.Registry.empty();
    });

    describe('getParentView', function () {
        it('returns undefined if no parent is registered', function () {
            var viewId = 'a',
                view = viewFixtureFactory(viewId);

            assert.notOk(wig.ViewManager.getParentView(view));
        });

        it('returns parent view', function () {
            var childId = 'a',
                parentId = 'b',
                parent = viewFixtureFactory(parentId),
                child = viewFixtureFactory(childId, parentId);

            assert.equal(wig.ViewManager.getParentView(child), parent);
        });
    });

    describe('getView', function () {
        it('returns the registered view', function () {
            var id = 'a',
                view = wig.test.viewFixtureFactory(id);

            wig.View.Registry.set(id, {
                view: view
            });

            assert.equal(wig.ViewManager.getView(id), view);
        });
    });

    describe('getViewAtNode', function () {
        it('returns the view associated to an Element by it\'s data attribute', function () {
            var view = {},
                id = 'a',
                div = document.createElement('div');

            div.dataset[wig.DATA_ATTRIBUTE] = id;
            wig.View.Registry.set(id, {
                view: view
            });

            assert.equal(wig.ViewManager.getViewAtNode(div), view);
        });
    });

    describe('notifyViewAboutAttach & notifyViewAboutDetach', function () {
        it('attach', function () {
            var viewId = 'a',
                view = wig.test.viewFixtureFactory(viewId);

            wig.ViewManager.notifyViewAboutAttach(viewId);

            assert.ok(view.notifyAttach.calledOnce);
        });

        it('detach', function () {
            var viewId = 'a',
                view = wig.test.viewFixtureFactory(viewId);

            wig.ViewManager.notifyViewAboutDetach(viewId);

            assert.ok(view.notifyDetach.calledOnce);
        });
    });

    describe('getRootNodeMapping', function () {
        it('returns parent view\'s DOM node by default', function () {
            var childID = 'a',
                child = viewFixtureFactory(childID),
                parentID = 'b',
                parent = viewFixtureFactory(parentID),
                parentDOMNode = {};

            parent.getNode.returns(parentDOMNode);

            assert.equal(
                wig.ViewManager.getRootNodeMapping(parent, child),
                parentDOMNode
            );
        });

        it('returns an element specified by a selector within the parent\'s DOM node', function () {
            var childID = 'a',
                parentID = 'b',
                child = viewFixtureFactory(childID),
                parent = viewFixtureFactory(parentID),
                parentDOMNode = {},
                selector = 'h1',
                getElementStub = sinon.stub(wig.env.dom, 'getElement');

            parent.getNode.returns(parentDOMNode);
            parent.getSelectorForChild.returns(selector);

            wig.ViewManager.getRootNodeMapping(parent, child);

            assert.ok(getElementStub.calledOnce);
            assert.ok(getElementStub.calledWithExactly(parentDOMNode, selector));

            getElementStub.restore();
        });
    });

    describe('destroyViewAtNode', function () {
        it('destroys the view associated to an Element by it\'s data attribute', function () {
            var id = 'a',
                view = wig.test.viewFixtureFactory(id),
                div = document.createElement('div');

            div.dataset[wig.DATA_ATTRIBUTE] = id;

            wig.ViewManager.destroyViewAtNode(div);

            assert.ok(view.remove.calledOnce);
        });
    });
});