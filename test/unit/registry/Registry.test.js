describe('registry/Registry', function () {
    "use strict";

    var assert = chai.assert;

    it('class', function () {
        var registry = new wig.Registry();

        assert.equal(typeof wig.Registry, 'function');
        assert.ok(registry.root);
    });

    it('#set', function () {
        var registry = new wig.Registry();

        registry.set('a', 1);

        assert.equal(Object.keys(registry.root).length, 1);
        assert.equal(registry.root.a, 1);
    });

    it('#unset', function () {
        var registry = new wig.Registry(),
            object = {};

        registry.set('a', object);
        registry.unset('a');

        assert.equal(registry.get('a'), undefined);
        assert.equal(Object.keys(registry.root).length, 0);
    });

    it('#get', function () {
        var registry = new wig.Registry(),
            object = {};

        registry.set('a', object);

        assert.equal(registry.get('a'), object);
    });

    it('#each', function () {
        var registry = new wig.Registry(),
            results = {};

        registry.set('a', 1);
        registry.set('b', 2);
        registry.set('c', 3);

        registry.each(function (key, value) {
            assert.equal(this, results);
            this[key] = value;
        }, results);

        assert.deepEqual(results, {
            a: 1,
            b: 2,
            c: 3
        });
    });

    it('#empty', function () {
        var registry = new wig.Registry();

        registry.set('a', 1);
        registry.set('b', 2);
        registry.set('c', 3);

        registry.empty();

        assert.equal(Object.keys(registry.root).length, 0);
    });
});