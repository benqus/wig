describe("Compiler", function () {
    'use strict';

    var assert = chai.assert;
    var Compiler = new wig.module.Compiler();

    afterEach(function () {
        Compiler.disposeMarkups();
    });

    it("can compile a placeholder", function () {
        var compiled = Compiler.compile("{{ a }}", {
            a: "a"
        });

        assert.equal(compiled, "a");
    });

    it("can compile a template with a simple map", function () {
        var compiled = Compiler.compile("a {{ a }} b {{b}} c {{  c  }} end", {
            a: "a",
            b: "b",
            c: "c"
        });

        assert.equal(compiled, "a a b b c c end");
    });

    it("can compile a template with a nested map", function () {
        var compiled = Compiler.compile("a {{ moo.aye }} b {{ moo.bii.bee }} c {{ moo.see.ya.there }}", {
            moo: {
                aye: "a",
                bii: {
                    bee: "b"
                },
                see: {
                    ya: {
                        there: "c"
                    }
                }
            }
        });

        assert.equal(compiled, "a a b b c c");
    });

    it("can cache templates", function () {
        var template = "a {{ a }}";
        Compiler.compile(template, {
            a: "a"
        });

        assert.ok(Compiler.getCompiled(template));
    });

    it("will not cache templates without placeholder", function () {
        var template = "hakuna matata";
        Compiler.compile(template);

        assert.notOk(Compiler.getCompiled(template));
    });

    it("can pre-compile a template but not compile it", function () {
        var compiled = Compiler.compile("{{ a }}");
        assert.notOk(compiled);
    });

    it("can dispose the cached templates", function () {
        var template = "a {{ a }}";
        Compiler.compile(template, {
            a: "a"
        });

        Compiler.disposeMarkups();

        assert.notOk(Compiler.getCompiled(template));
    });

});