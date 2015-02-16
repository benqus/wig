describe('wig.setup', function () {
    'use strict';

    var assert = chai.assert;

    it('overrides methods used by the library', function () {
        var compile = wig.api.compile,
            getElement = wig.api.getElement,
            config = {
                getElement: function () {},
                compile: function () {}
            };

        wig.setup(config);

        assert.equal(wig.api.compile, config.compile);
        assert.equal(wig.api.getElement, config.getElement);

        wig.api.compile = compile;
        wig.api.getElement = getElement;
    });
});