(function() {
    //#imports
    describe('Bricks.Component', function() {
        it('Passing config', function() {
            var c = new Bricks.Component({
                foo: 5
            });
            assert.equal(c.foo, 5);
        });

        it('Prototype properties', function() {
            var C = Bricks.Component.inherit({
                a: 5,
                b: 6
            });
            var c = new C({a: 7});
            assert.equal(c.a, 7);
            assert.equal(c.b, 6);
        });

        it('Method listeners', function() {
            var c1 = new Bricks.Component();
            var foo;
            var C2 = Bricks.Component.inherit({
                a: 5,

                b: 6,

                _initComponent: function() {
                    C2.superclass._initComponent.apply(this, arguments);
                    this._on(c1, 'event1', this.method1);
                    this._on(c1, 'event2', this.method2);
                },

                method1: function() {
                    foo = this.a;
                },

                method2: function() {
                    foo = this.b;
                }
            });
            var c2 = new C2();
            c1._fireEvent('event1');
            assert.equal(foo, 5);
            c2.destroy();
            c1._fireEvent('event2');
            assert.equal(foo, 5);
        });
    });
})();
