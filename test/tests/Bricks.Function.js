(function() {
    //#imports
    describe('Bricks.Function', function() {
        // window.setTimeout и голые setTimeout/clearTimeout ведут на одни fake-часы
        // (BricksTest.clock): реальное время в сьюите не используется.

        describe('defer', function() {
            it('вызывает fn через delay в контексте ctx с аргументами args', function() {
                var calls = [];
                var ctx = {name: 'ctx'};
                var fn = function(a, b) {
                    calls.push([this.name, a, b]);
                };
                Bricks.Function.defer(fn, 5, ctx, [1, 2]);
                BricksTest.clock.tick(4);
                assert.equal(calls.length, 0);
                BricksTest.clock.tick(1);
                assert.deepEqual(calls, [['ctx', 1, 2]]);
            });

            it('без ctx и args: this не привязан, нулевая длина arguments', function() {
                var seen;
                var fn = function() {
                    seen = [this, arguments.length];
                };
                Bricks.Function.defer(fn, 1);
                BricksTest.clock.tick(1);
                // Без ctx вызов идёт как fn.apply(undefined, []): его this зависит от
                // режима самой функции fn — в strict-прогоне это undefined, в обычном
                // (sloppy) прогоне — глобальный объект. Оба варианта — «не привязан».
                assert.ok(seen[0] === undefined || seen[0] === globalThis);
                assert.equal(seen[1], 0);
            });

            it('возвращает идентификатор таймаута; clearTimeout по нему отменяет вызов', function() {
                var called = 0;
                var id = Bricks.Function.defer(function() {
                    called++;
                }, 100);
                assert.equal(typeof id, 'number');
                BricksTest.clock.clearTimeout(id);
                BricksTest.clock.tick(1000);
                assert.equal(called, 0);
            });
        });

        describe('bind', function() {
            it('фиксирует контекст и префиксные аргументы, возвращает результат', function() {
                var ctx = {n: 10};
                var bound = Bricks.Function.bind(function(a, b) {
                    return this.n + a + b;
                }, ctx, 1);
                assert.equal(bound(2), 13);
            });

            it('ctx = null — контекст берётся из this вызова', function() {
                var selfSeen;
                var bound = Bricks.Function.bind(function(a) {
                    selfSeen = this;
                }, null, 1);
                var obj = {marker: true};
                bound.call(obj, 2);
                assert.strictEqual(selfSeen, obj);
            });
        });

        describe('debounce', function() {
            it('из частых вызовов происходит только последний', function() {
                var calls = [];
                var d = Bricks.Function.debounce(function(a) {
                    calls.push(a);
                }, 10);
                // Три вызова на t = 0, 1, 2 — каждый сбрасывает предыдущий таймер.
                d('a');
                BricksTest.clock.tick(1);
                d('b');
                BricksTest.clock.tick(1);
                d('c');
                assert.equal(calls.length, 0);
                BricksTest.clock.tick(12);
                assert.deepEqual(calls, ['c']);
            });

            it('контекст ctx', function() {
                var ctx = {tag: 'x'};
                var ctxSeen;
                var d = Bricks.Function.debounce(function() {
                    ctxSeen = this;
                }, 5, ctx);
                d();
                BricksTest.clock.tick(5);
                assert.strictEqual(ctxSeen, ctx);
            });

            it('без ctx — контекст вызова', function() {
                var selfSeen;
                var d = Bricks.Function.debounce(function() {
                    selfSeen = this;
                }, 5);
                var self = {m: 1};
                d.call(self);
                BricksTest.clock.tick(5);
                assert.strictEqual(selfSeen, self);
            });
        });

        describe('throttle', function() {
            it('первый вызов сразу, следующие — не чаще delay; очередь догоняется', function() {
                var calls = [];
                var t = Bricks.Function.throttle(function(a) {
                    calls.push(a);
                }, 10);
                t('1'); // t = 0: timer null → сразу; таймер на t = 10
                t('2'); // t = 0: timer активен → отложено
                BricksTest.clock.tick(10); // run: '2'; таймер на t = 20
                t('3'); // t = 10: отложено
                BricksTest.clock.tick(10); // t = 20: '3'; таймер на t = 30
                BricksTest.clock.tick(10); // t = 30: пустой run — очередей нет, вызова нет
                assert.deepEqual(calls, ['1', '2', '3']);
            });

            it('после последнего run очередей и таймеров не остаётся', function() {
                var calls = 0;
                var t = Bricks.Function.throttle(function() {
                    calls++;
                }, 10);
                t(); // сразу
                BricksTest.clock.tick(10); // пустой run
                assert.equal(calls, 1);
                BricksTest.clock.tick(1000);
                assert.equal(calls, 1);
            });

            it('контекст ctx', function() {
                var ctx = {tag: 'throttle'};
                var ctxSeen;
                var t = Bricks.Function.throttle(function() {
                    ctxSeen = this;
                }, 10, ctx);
                t();
                assert.strictEqual(ctxSeen, ctx);
            });

            it('без ctx — контекст вызова (батч 1: именованный run вместо arguments.callee)', function() {
                var selfSeen;
                var t = Bricks.Function.throttle(function() {
                    selfSeen = this;
                }, 10);
                var self = {m: 1};
                t.call(self, 'a');
                t.call(self, 'b');
                BricksTest.clock.tick(10);
                assert.strictEqual(selfSeen, self);
            });
        });
    });
})();