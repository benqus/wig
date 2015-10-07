describe('Selection', function () {
    'use strict';

    var assert = chai.assert,
        domFixture,
        testView;

    // Test View class
    var TestView = wig.View.extend({
        template: [
            '<div>',
                '<div>',
                    '<button class="focused">selected</button>',
                    '<input class="selected" value="hakuna matata" />',
                '</div>',
            '</div>'
        ]
    });

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    beforeEach(function () {
        testView = new TestView();
        wig.renderView(testView, domFixture);
    });

    afterEach(function () {
        domFixture.innerHTML = '';
    });

    it('preserves the focused element when View is updated', function () {
        testView.getNode().querySelector('.focused')
            .focus();

        testView.update();

        assert.equal(document.activeElement.className, 'focused');
    });

    it('preserves the focused element when View is updated', function () {
        var input = testView.getNode().querySelector('.selected');

        input.setSelectionRange(3, 5);
        input.focus();

        testView.update();

        assert.equal(document.activeElement.className, 'selected');
        assert.equal(document.activeElement.selectionStart, 3);
        assert.equal(document.activeElement.selectionEnd, 5);
    });
});