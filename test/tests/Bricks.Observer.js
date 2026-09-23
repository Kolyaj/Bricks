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

        it('обработчики вызываются в обратном порядке подписки', function() {
            var o = new Bricks.Observer();
            var calls = [];
            o.addEventListener('e', function() {
                calls.push('l1');
            });
            o.addEventListener('e', function() {
                calls.push('l2');
            });
            o._fireEvent('e');
            assert.deepEqual(calls, ['l2', 'l1']);
        });

        it('wildcard "*" получает событие вместе с именованными обработчиками', function() {
            var o = new Bricks.Observer();
            var named = 0;
            var wild = 0;
            o.addEventListener('e', function() {
                named++;
            });
            o.addEventListener('*', function() {
                wild++;
            });
            o._fireEvent('e');
            assert.equal(named, 1);
            assert.equal(wild, 1);
            // Порядок между именованными и wildcard не контракт — не фиксируем.
        });

        it('data-объект не переопределяет type и target', function() {
            var o = new Bricks.Observer();
            var other = {};
            var seen;
            o.addEventListener('event', function(evt) {
                seen = evt;
            });
            o._fireEvent('event', {type: 'hacked', target: other, foo: 5});
            assert.equal(seen.type, 'event');
            assert.strictEqual(seen.target, o);
            assert.equal(seen.foo, 5);
        });

        it('обработчик, вернувший false, останавливает распространение', function() {
            var o = new Bricks.Observer();
            var l1 = 0;
            var l2 = 0;
            // l2 подписан позже → вызывается первым и останавливает событие.
            o.addEventListener('e', function() {
                l1++;
            });
            o.addEventListener('e', function() {
                l2++;
                return false;
            });
            var result = o._fireEvent('e');
            assert.strictEqual(result, false);
            assert.equal(l2, 1);
            assert.equal(l1, 0);
        });

        it('ошибка в обработчике: _handleListenerError (отложенный throw), остальные обработчики вызываются, событие не считается остановленным', function() {
            var o = new Bricks.Observer();
            var normal = 0;
            // Первый подписан → вызывается последним: бросает ошибку.
            o.addEventListener('e', function() {
                throw new Error('boom');
            });
            o.addEventListener('e', function() {
                normal++;
            });
            var result = o._fireEvent('e');
            assert.strictEqual(result, true);
            assert.equal(normal, 1);
            // Ошибка всплывает по прошествии 10мс (отложенный throw по умолчанию).
            assert.throws(function() {
                BricksTest.clock.tick(10);
            }, /boom/);
        });

        it('addEventListener на прототипе срабатывает на всех инстансах этого прототипа и только на них', function() {
            var P = Bricks.inherit(Bricks.Observer);
            var calls = 0;
            P.prototype.addEventListener('e', function() {
                calls++;
            });
            new P()._fireEvent('e');
            new P()._fireEvent('e');
            assert.equal(calls, 2);
            // Чужой класс от того же родителя — не слышит чужой прототип.
            var Q = Bricks.inherit(Bricks.Observer);
            new Q()._fireEvent('e');
            assert.equal(calls, 2);
        });
    });
})();