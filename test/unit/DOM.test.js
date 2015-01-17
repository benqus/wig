describe('DOM#attachNodeToParent', function () {
    'use strict';

    var assert = chai.assert,
        domFixture;

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    afterEach(function () {
        domFixture.innerHTML = '';
    });

    describe('attachNodeToParent', function () {

        it('appends child', function () {
            var div = document.createElement('div');

            domFixture.innerHTML = '<div></div>';

            wig.DOM.attachNodeToParent(div, domFixture);

            assert.equal(domFixture.children[domFixture.children.length - 1], div);
        });

        it('inserts child', function () {
            var div = document.createElement('div'),
                index = 1;

            domFixture.innerHTML = '<div></div><div></div>';

            wig.DOM.attachNodeToParent(div, domFixture, index);

            assert.equal(domFixture.children[index], div);
        });

    });

    describe('findClosestViewNode', function () {
        it('invokes the default Element#querySelector method on the node', function () {
            var div = document.createElement('div'),
                domStub = sinon.stub(domFixture, 'querySelector'),
                selector = 'h1';

            domFixture.innerHTML = [
                '<div>',
                '<header>',
                '<h1></h1>',
                '</header>',
                '</div>'
            ].join('');

            wig.DOM.getElement(domFixture, selector);

            assert.ok(domStub.calledOnce);
            assert.ok(domStub.calledWithExactly(selector));

            domStub.restore();
        });
    });

    describe('getElement', function () {

        it('invokes the default Element#querySelector method on the node', function () {
            var div = document.createElement('div'),
                domStub = sinon.stub(domFixture, 'querySelector'),
                selector = 'h1';

            domFixture.innerHTML = [
                '<div>',
                '<header>',
                '<h1></h1>',
                '</header>',
                '</div>'
            ].join('');

            wig.DOM.getElement(domFixture, selector);

            assert.ok(domStub.calledOnce);
            assert.ok(domStub.calledWithExactly(selector));

            domStub.restore();
        });

    });

    describe('initNode', function () {

        it('applies provided classes as a String', function () {
            var div = document.createElement('div'),
                classes = 'a b c';

            wig.DOM.initNode(div, classes);

            assert.equal(div.className, classes);
        });

        it('applies provided classes as an Array', function () {
            var div = document.createElement('div'),
                classes = ['a', 'b', 'c'];

            wig.DOM.initNode(div, classes);

            assert.equal(div.className, classes.join(' '));
        });

        it('applies provided classes as a map', function () {
            var div = document.createElement('div'),
                classes = {
                    a: true,
                    b: false,
                    c: 'c',
                    d: 0
                };

            wig.DOM.initNode(div, classes);

            assert.equal(div.className, 'a c');
        });

        it('applies provided dataset', function () {
            var div = document.createElement('div'),
                dataset = {
                    a: '1'
                };

            wig.DOM.initNode(div, null, dataset);

            assert.deepEqual(div.dataset, dataset);
        });

    });

    describe('selectNode', function () {

        it('returns the provided element', function () {
            var node = document.getElementById('fixture');

            assert.equal(wig.DOM.selectNode(node), node);
        });

        it('returns an element described by a selector', function () {
            var getElementStub = sinon.stub(wig.DOM, 'getElement'),
                selector = 'fixture';

            wig.DOM.selectNode(selector);

            assert.ok(getElementStub.calledWithExactly(document.body, selector));

            getElementStub.restore();
        });

    });

});