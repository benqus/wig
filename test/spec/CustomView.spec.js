describe('View - custom', function () {
    'use strict';

    var assert = chai.assert,
        View   = wig.View,
        domFixture;

    before(function () {
        domFixture = document.getElementById('fixture');
    });

    afterEach(function () {
        domFixture.innerHTML = '';
        wig.env.ViewRegistry.empty();
    });

    it('uses custom tagName', function () {
        var CustomView = View.extend({
                tagName: 'p'
            }),
            view = new CustomView();

        assert.equal(view.node.constructor, HTMLParagraphElement);
    });

    it('applies className with inherited View className', function () {
        var CustomViewParent = View.extend({
                className: 'CustomViewParent'
            }),
            CustomView = CustomViewParent.extend({
                className: 'CustomView'
            }),
            view = new CustomView();

        assert.equal(view.node.getAttribute('class'), 'View CustomViewParent CustomView');
    });

    it('applies className with inherited View className', function () {
        var CustomViewParent = View.extend({
                className: 'CustomViewParent'
            }),
            CustomView = CustomViewParent.extend({
                className: 'CustomView'
            }),
            view = new CustomView();

        assert.equal(view.node.getAttribute('class'), 'View CustomViewParent CustomView');
    });

    it('renders template with defaults', function () {
        var template = '<h1>{{ title }}</h1>',
            title = 'title',
            CustomView = View.extend({
                template: template,
                defaults: {
                    title: title
                }
            }),
            view = new CustomView({
                title: title
            });

        wig.renderView(view, domFixture);

        assert.equal(view.getNode().innerHTML, template.replace('{{ title }}', title));
    });

    it('renders template with context', function () {
        var title = 'title',
            template = '<h1>{{ title }}</h1>',
            CustomView = View.extend({
                template: template
            }),
            view = new CustomView({
                title: title
            });

        wig.renderView(view, domFixture);

        assert.equal(view.getNode().innerHTML, template.replace('{{ title }}', title));
    });

    it('props are available on the View instance', function () {
        var expects = [
                'a',
                'b'
            ],
            a = {},
            b = {},
            CustomView = View.extend({
                expects: expects
            }),
            view = new CustomView({
                a: a,
                b: b
            });

        assert.equal(view.a, a);
        assert.equal(view.b, b);
    });

    it('events are invoked on the View instance', function (done) {
        var CustomView = View.extend({
                events: {
                    click: function (evt) {
                        assert.equal(evt, event);
                        done();
                    }
                }
            }),
            view = new CustomView(),
            event = {
                target: view.getNode(),
                type: 'click'
            };

        wig.renderView(view, domFixture);

        wig.env.UIEventProxy.listener(event);
    });

    it('parses context by returning a new context generated by the parsing method', function () {
        var context = {
                a: 1
            },
            CustomView = View.extend({
                parseContext: function (newContext) {
                    return {
                        a: newContext.a,
                        b: newContext.a + 1
                    };
                }
            }),
            view = new CustomView(context);

        assert.equal(view.get('a'), context.a);
        assert.equal(view.get('b'), context.a + 1);
    });

    it('parses context by decorating the context', function () {
        var context = {
                a: 1
            },
            CustomView = View.extend({
                parseContext: function (newContext) {
                    newContext.b = newContext.a + 1;
                }
            }),
            view = new CustomView(context);

        assert.equal(view.get('a'), context.a);
        assert.equal(view.get('b'), context.a + 1);
    });

    it('onAttach is executed after the has been rendered into the DOM', function () {
        var CustomView = View.extend({
                onAttach: function () {
                    assert.equal(this.getNode().parentNode, domFixture);
                }
            }),
            view = new CustomView();

        wig.renderView(view, domFixture);
    });

    it('onDetach is before the is detached from the DOM', function () {
        var CustomView = View.extend({
                onDetach: function () {
                    assert.equal(this.getNode().parentNode, domFixture);
                }
            }),
            view = new CustomView();

        wig.renderView(view, domFixture);
        view.remove();

        assert.equal(view.getNode(), null);
    });

    it('View#getAttributes', function () {
        var CustomView = View.extend({
                tagName: 'button',
                getAttributes: function () {
                    return {
                        disabled: 'disabled',
                        a: 'a'
                    };
                }
            }),
            view = new CustomView();

        assert.ok(view.getNode().disabled);
        assert.equal(view.getNode().a, 'a');
    });

    it('View updates with new context attributes', function () {
        var TestView = View.extend({
                defaults: {
                    a: 'a'
                },
                template: '{{ a }}{{ b }}'
            }),
            view = new TestView({
                b: 'b'
            });

        wig.renderView(view, domFixture);

        assert.equal(view.getNode().innerHTML, 'ab');

        view.update({
            a: 'c'
        });

        assert.equal(view.getNode().innerHTML, 'cb');
    });

});