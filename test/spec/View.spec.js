describe('View', function () {
    'use strict';

    var assert = chai.assert,
        View   = wig.View,
        domFixture;

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    afterEach(function () {
        domFixture.innerHTML = '';
        wig.View.Registry.empty();
    });

    it('Simple View instance initializes for a DOM node', function () {
        var view = new View();

        assert.equal(view.attached, false);
        assert.equal(view.node.constructor, HTMLDivElement);
        assert.equal(view.node.dataset[wig.DATA_ATTRIBUTE], view.getID());
        assert.deepEqual(view.node.getAttribute('class'), 'View');
    });

    it('Simple View instance with basic options', function () {
        var id = 'a',
            css = 'a',
            node = document.createElement('a'),
            view = new View({
                id: id,
                css: css,
                node: node
            });

        assert.equal(view.getID(), id);
        assert.equal(view.node, node);
        assert.deepEqual(view.node.getAttribute('class'), 'View ' + css);
        assert.deepEqual(view.context, {});
    });

    it('Simple View instance with context options', function () {
        var a = 'a',
            b = 'b',
            view = new View({
                a: a,
                b: b
            });

        assert.equal(view.get('a'), a);
        assert.equal(view.get('b'), b);
    });

    it('wig.renderView appends the View in the provided node', function () {
        var view = new View();

        wig.renderView(view, domFixture);

        assert.equal(view.attached, true);
        assert.equal(view.getNode().parentNode, domFixture);
    });

});