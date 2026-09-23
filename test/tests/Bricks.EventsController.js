(function() {
    //#imports
    describe('Bricks.EventsController', function() {
        // Синяк без внешних зависимостей: sinon в Node не используется.
        var makeSpy = function() {
            var fn = function(evt) {
                fn.calls.push(evt);
            };
            fn.calls = [];
            return fn;
        };

        it('Observable one event', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = makeSpy();
            c.on(o, 'action', callback);
            o._fireEvent('action');
            c.un(o, 'action', callback);
            o._fireEvent('action');
            assert.equal(callback.calls.length, 1);
        });

        it('Observable two events', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = makeSpy();
            c.on(o, 'action1, action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            c.un(o, 'action1', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            c.un(o, 'action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.equal(callback.calls.length, 3);
        });

        it('pause/resume', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = makeSpy();

            c.on(o, 'action1', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.equal(callback.calls.length, 1);

            c.pause();
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.equal(callback.calls.length, 1);

            c.on(o, 'action2', callback);
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.equal(callback.calls.length, 1);

            c.resume();
            c.resume();
            o._fireEvent('action1');
            o._fireEvent('action2');
            assert.equal(callback.calls.length, 3);
        });

        it('unAll', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var callback = makeSpy();
            c.on(o, 'action', callback);
            o._fireEvent('action');
            c.unAll();
            o._fireEvent('action');
            assert.equal(callback.calls.length, 1);
        });

        it('Custom event type', function() {
            var EventType = Bricks.inherit(Bricks.Component, {
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
            var callback = makeSpy();
            c.on(o, EventType, callback);
            o._fireEvent('action');
            c.unAll();
            o._fireEvent('action');
            assert.equal(callback.calls.length, 1);
        });

        // IE6-8: событие приходит без аргумента — берётся из глобального window.event.
        it('ветка window.event: вызов обработчика без evt', function() {
            var el = {
                addEventListener: function(name, fn) {
                    this._handler = fn;
                },
                removeEventListener: function() {
                    this._handler = null;
                }
            };
            var c = new Bricks.EventsController();
            var callback = makeSpy();
            c.on(el, 'action', callback);
            window.event = {foo: 'bar'};
            try {
                el._handler(); // без аргумента → evt || window.event
            } finally {
                // window на прогон общий: глобал обязаны убрать.
                delete window.event;
            }
            assert.equal(callback.calls.length, 1);
            assert.equal(callback.calls[0].foo, 'bar');
        });

        it('un с другим fn не снимает чужой обработчик', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var fnA = makeSpy();
            var fnB = makeSpy();
            c.on(o, 'action', fnA);
            c.un(o, 'action', fnB);
            o._fireEvent('action');
            assert.equal(fnA.calls.length, 1);
            assert.equal(fnB.calls.length, 0);
            c.un(o, 'action', fnA);
            o._fireEvent('action');
            assert.equal(fnA.calls.length, 1);
        });

        it('контекст ctx', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            var ctx = {};
            var selfSeen;
            c.on(o, 'action', function() {
                selfSeen = this;
            }, ctx);
            o._fireEvent('action');
            assert.strictEqual(selfSeen, ctx);
        });

        it('_normalizeEventTypes: число — TypeError', function() {
            var o = new Bricks.Observer();
            var c = new Bricks.EventsController();
            assert.throws(function() {
                c.on(o, 42, function() {});
            }, TypeError);
        });
    });
})();