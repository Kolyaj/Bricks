(function() {
    //#imports
    describe('Bricks.Observer', function() {
        it('Single event', function() {
            var o = new Bricks.Observer();
            var hasEvent = false;
            o.addEventListener('event', function() {
                hasEvent = true;
            });
            o._fireEvent('event');
            assert.ok(hasEvent);
        });

        it('Passing event object', function() {
            var o = new Bricks.Observer();
            var target;
            var type;
            o.addEventListener('event', function(evt) {
                target = evt.target;
                type = evt.type;
            });
            o._fireEvent('event');
            assert.equal(target, o);
            assert.equal(type, 'event');
        });

        it('Passing data', function() {
            var o = new Bricks.Observer();
            var foo;
            o.addEventListener('event', function(evt) {
                foo = evt.foo;
            });
            o._fireEvent('event', {foo: 5});
            assert.equal(foo, 5);
        });

        it('Removing listener', function() {
            var o = new Bricks.Observer();
            var foo = 0;
            var listener = function() {
                foo++;
            };
            o.addEventListener('event', listener);
            o._fireEvent('event');
            assert.equal(foo, 1);
            o.removeEventListener('event', listener);
            o._fireEvent('event');
            assert.equal(foo, 1);
        });
    });
})();
