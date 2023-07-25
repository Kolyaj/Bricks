(function() {
    //#imports
    describe('Bricks.EventsController', function() {
        it('Observable one event', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = sinon.spy();
            c.on(o, 'action', callback);
            o._fireEvent('action');
            c.un(o, 'action', callback);
            o._fireEvent('action');
            assert.ok(callback.calledOnce);
        });

        it('Observable two events', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = sinon.spy();
            c.on(o, 'action1, action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            c.un(o, 'action1', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            c.un(o, 'action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.ok(callback.calledThrice);
        });

        it('pause/resume', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = sinon.spy();

            c.on(o, 'action1', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.ok(callback.calledOnce);

            c.pause();
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.ok(callback.calledOnce);

            c.on(o, 'action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.ok(callback.calledOnce);

            c.resume();
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.ok(callback.calledThrice);
        });

        it('unAll', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = sinon.spy();
            c.on(o, 'action', callback);
            o._fireEvent('action');
            c.unAll();
            o._fireEvent('action');
            assert.ok(callback.calledOnce);
        });

        it('Custom event type', function() {
            var EventType = Bricks.Component.inherit({
                constructor: function(el) {
                    EventType.superclass.constructor.apply(this);
                    this._on(el, 'action', this._onAction);
                },

                _onAction: function() {
                    this._fireEvent('action');
                }
            });
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = sinon.spy();
            c.on(o, EventType, callback);
            o._fireEvent('action');
            c.unAll();
            o._fireEvent('action');
            assert.ok(callback.calledOnce);
        });
    });
})();
