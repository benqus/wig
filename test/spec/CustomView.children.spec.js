describe('CustomView with child Views', function () {

    var assert = chai.assert,
        View = wig.View,
        domFixture;

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    afterEach(function () {
        domFixture.innerHTML = '';
        wig.env.ViewRegistry.empty();
    });

    it('View renders (appends) child nodes in order into its own DOM node', function () {
        var child1,
            child2,
            CustomView = View.extend({
                render: function () {
                    child1 = View.add({}, this);
                    child2 = View.add({}, this);
                }
            }),
            view = new CustomView();

        wig.renderView(view, domFixture);

        assert(view.getNode().children.length, 2);
        assert(view.getNode().children[0].dataset[wig.env.DATA_ATTRIBUTE], child1.getID());
        assert(view.getNode().children[1].dataset[wig.env.DATA_ATTRIBUTE], child2.getID());
    });

    it('View renders (appends) child nodes in order into the template with "*"', function () {
        var child1,
            child2,
            CustomView = View.extend({
                template: '<section></section>',
                renderMap: {
                    '*': 'section'
                },
                render: function () {
                    child1 = View.add({}, this);
                    child2 = View.add({}, this);
                }
            }),
            view = new CustomView(),
            section;

        wig.renderView(view, domFixture);
        section = view.getNode().children[0];

        assert(section.children.length, 2);
        assert(section.children[0].dataset[wig.env.DATA_ATTRIBUTE], child1.getID());
        assert(section.children[1].dataset[wig.env.DATA_ATTRIBUTE], child2.getID());
    });

    it('View renders (appends) named child nodes in order into the template by their name', function () {
        var child1,
            child2,
            CustomView = View.extend({
                template: [
                    '<ul>',
                        '<li class="first"></li>',
                        '<li class="second"></li>',
                    '</ul>'
                ],
                renderMap: {
                    'c1': '.first',
                    'c2': '.second'
                },
                render: function () {
                    child1 = View.add({
                        id: 'c1'
                    }, this);
                    child2 = View.add({
                        id: 'c2'
                    }, this);
                }
            }),
            view = new CustomView();

        wig.renderView(view, domFixture);

        assert(view.getNode().querySelector('.first').firstChild.dataset[wig.env.DATA_ATTRIBUTE], child1.getID());
        assert(view.getNode().querySelector('.second').firstChild.dataset[wig.env.DATA_ATTRIBUTE], child2.getID());
    });
});