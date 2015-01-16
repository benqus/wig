describe('methods/generateID', function () {
    'use strict';

    var assert = chai.assert;

    it('generates a unique ID with a prefix', function () {
        var id = wig.generateID('a');
        assert.equal(id, 'a0');
    });

    it('generates a unique ID with an incremental counter', function () {
        var ids = [
            wig.generateID(),
            wig.generateID()
        ];
        assert.deepEqual(ids, [1, 2]);
    });
});