describe('registry/ViewRegistry', function () {
    "use strict";

    var assert = chai.assert;

    it('is a Registry', function () {
        assert.ok(wig.ViewRegistry instanceof wig.Registry);
    });
});