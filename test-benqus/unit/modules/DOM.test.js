describe('DOM', function () {
    'use strict';

    var assert = chai.assert,
        DOM = new wig.module.DOM(),
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

            DOM.attachNodeToParent(div, domFixture);

            assert.equal(domFixture.children[domFixture.children.length - 1], div);
        });

        it('inserts child', function () {
            var div = document.createElement('div'),
                index = 1;

            domFixture.innerHTML = '<div></div><div></div>';

            DOM.attachNodeToParent(div, domFixture, index);

            assert.equal(domFixture.children[index], div);
        });

    });

    describe('initNode', function () {

        it('applies provided classes as a String', function () {
            var div = document.createElement('div'),
                classes = 'a b c';

            DOM.initNode(div, classes);

            assert.equal(div.className, classes);
        });

        it('applies provided classes as an Array', function () {
            var div = document.createElement('div'),
                classes = ['a', 'b', 'c'];

            DOM.initNode(div, classes);

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

            DOM.initNode(div, classes);

            assert.equal(div.className, 'a c');
        });

        it('applies provided dataset', function () {
            var div = document.createElement('div'),
                dataset = {
                    a: '1'
                };

            DOM.initNode(div, null, null, dataset);

            assert.deepEqual(div.dataset, dataset);
        });
    });
});