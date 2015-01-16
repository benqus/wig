describe('methods/extend', function () {
    'use strict';

    var assert = chai.assert;

    it('returns the first argument object', function () {
        var object = {};
        assert.equal(wig.extend(object), object);
    });

    it('merges all the attributes from all argument objects to a result obejct', function () {
        var result = wig.extend(
            {a: 1},
            {b: 2},
            {c: 3}
        );

        assert.deepEqual(result, {
            a: 1,
            b: 2,
            c: 3
        });
    });
});