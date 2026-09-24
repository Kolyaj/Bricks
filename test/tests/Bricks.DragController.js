(function() {
    //#imports
    describe('Bricks.DragController (fake-события: sink-интерфейс doc/el)', function() {
        var profiles = BricksTest.Profiles;

        // Фикстура: el (modern) + doc (форма) + контроллер с логгером.
        // Подписки старт/движение/конец — Observers контроллера (механизм —
        // его EventsController, интерфейс — sink, ADR 0003).
        var fixture = function(docForm, docOpts, cfg) {
            var doc = profiles.doc[docForm](docOpts || {});
            var el = profiles.el.modern('', {ownerDocument: doc});
            var controller = new Bricks.DragController(Bricks.mixin({el: el}, cfg || {}));
            var log = {start: [], move: [], end: []};
            controller.addEventListener('start', function(evt) {
                log.start.push(evt);
            });
            controller.addEventListener('move', function(evt) {
                log.move.push(evt);
            });
            controller.addEventListener('end', function(evt) {
                log.end.push(evt);
            });
            return {doc: doc, el: el, controller: controller, log: log};
        };

        describe('mouse', function() {
            it('start → move (delta от lastPos) → end → слушатели сняты со doc → второй цикл', function() {
                var f = fixture('modern', {scroll: [100, 50]});
                var down = profiles.event.modern({type: 'mousedown', target: f.el, pageX: 200, pageY: 100});
                f.el._fire('mousedown', down);
                assert.strictEqual(f.log.start.length, 1);
                // Event.stop: modern-ветка
                assert.strictEqual(down.defaultPrevented, true);
                assert.strictEqual(down.propagationStopped, true);
                // слушатели навешены на doc
                assert.strictEqual(f.doc._handlers.mousemove.length, 1);
                assert.strictEqual(f.doc._handlers.mouseup.length, 1);

                f.doc._fire('mousemove', profiles.event.modern({type: 'mousemove', target: f.el, pageX: 210, pageY: 105}));
                assert.deepEqual(f.log.move[0].delta, [10, 5]);
                assert.deepEqual(f.log.move[0].currentPos, [210, 105]);

                // second move — delta от предыдущей позиции
                f.doc._fire('mousemove', profiles.event.modern({type: 'mousemove', target: f.el, pageX: 215, pageY: 105}));
                assert.deepEqual(f.log.move[1].delta, [5, 0]);

                f.doc._fire('mouseup', profiles.event.modern({type: 'mouseup', target: f.el}));
                assert.strictEqual(f.log.end.length, 1);
                // слушатели сняты со doc (el — нет)
                assert.strictEqual(f.doc._handlers.mousemove.length, 0);
                assert.strictEqual(f.doc._handlers.mouseup.length, 0);
                assert.ok(f.el._handlers.mousedown.length);

                // второй цикл: el-подписки живы
                f.el._fire('mousedown', profiles.event.modern({type: 'mousedown', target: f.el, pageX: 300, pageY: 200}));
                assert.strictEqual(f.log.start.length, 2);
            });
            it('start вернул false — драга не началась, слушатели не навешены', function() {
                var f = fixture('modern', {});
                // Последний по подписке — вызывается первым (reverse order)
                // и останавливает событие.
                f.controller.addEventListener('start', function() {
                    return false;
                });
                var down = profiles.event.modern({type: 'mousedown', target: f.el, pageX: 10, pageY: 10});
                f.el._fire('mousedown', down);
                assert.strictEqual(f.log.start.length, 0);
                assert.strictEqual(f.log.move.length, 0);
                assert.strictEqual(f.log.end.length, 0);
                assert.ok(!f.doc._handlers.mousemove);
                assert.strictEqual(down.defaultPrevented, undefined);
            });
        });

        describe('touch', function() {
            it('один палец: start → move → end (координаты из touches[0])', function() {
                var f = fixture('modern', {});
                var down = profiles.event.touch({
                    type: 'touchstart', target: f.el,
                    touches: [{clientX: 200, clientY: 100, pageX: 200, pageY: 100}]
                });
                f.el._fire('touchstart', down);
                assert.strictEqual(f.log.start.length, 1);
                assert.strictEqual(f.doc._handlers.touchmove.length, 1);
                assert.strictEqual(f.doc._handlers.touchend.length, 1);

                // target — обязательный: Event.getPos читает ownerDocument
                // с target (в браузере у touchmove на document target —
                // элемент под пальцем).
                f.doc._fire('touchmove', profiles.event.touch({
                    type: 'touchmove', target: f.el,
                    touches: [{clientX: 210, clientY: 105, pageX: 210, pageY: 105}]
                }));
                assert.deepEqual(f.log.move[0].delta, [10, 5]);

                f.doc._fire('touchend', profiles.event.touch({type: 'touchend'}));
                assert.strictEqual(f.log.end.length, 1);
                assert.strictEqual(f.doc._handlers.touchmove.length, 0);
            });
            it('несколько пальцев — start не происходит', function() {
                var f = fixture('modern', {});
                var down = profiles.event.touch({
                    type: 'touchstart', target: f.el,
                    touches: [
                        {clientX: 0, clientY: 0, pageX: 0, pageY: 0},
                        {clientX: 50, clientY: 50, pageX: 50, pageY: 50}
                    ]
                });
                f.el._fire('touchstart', down);
                assert.strictEqual(f.log.start.length, 0);
                assert.ok(!f.doc._handlers.touchmove);
                assert.strictEqual(down.defaultPrevented, undefined);
            });
            it('touchEnabled: false — touchstart игнорируется, mousedown работает', function() {
                var f = fixture('modern', {}, {touchEnabled: false});
                f.el._fire('touchstart', profiles.event.touch({type: 'touchstart', target: f.el}));
                assert.strictEqual(f.log.start.length, 0);
                f.el._fire('mousedown', profiles.event.modern({type: 'mousedown', target: f.el, pageX: 1, pageY: 1}));
                assert.strictEqual(f.log.start.length, 1);
            });
        });

        // IE8-событие не имеет pageX — позиция считается clientX + scroll −
        // clientLeft/Top. При совпадающих данных результат ≡ modern-ветке.
        it('IE8-событие: clientX+scroll−clientLeft ≡ modern pageX', function() {
            var f = fixture('ie', {scroll: [100, 50]});
            var down = profiles.event.ie8({type: 'mousedown', target: f.el, clientX: 100, clientY: 50});
            f.el._fire('mousedown', down);
            assert.strictEqual(f.log.start.length, 1);
            // Event.stop: IE-ветка
            assert.strictEqual(down.returnValue, false);
            assert.strictEqual(down.cancelBubble, true);
            f.doc._fire('mousemove', profiles.event.ie8({type: 'mousemove', target: f.el, clientX: 110, clientY: 55}));
            assert.deepEqual(f.log.move[0].delta, [10, 5]); // ≡ modern: pageX 200 → 210
        });

        it('destroy — все подписки сняты (el и doc), исключений нет', function() {
            var f = fixture('modern', {scroll: [100, 50]});
            f.el._fire('mousedown', profiles.event.modern({type: 'mousedown', target: f.el, pageX: 200, pageY: 100}));
            assert.strictEqual(f.doc._handlers.mousemove.length, 1);
            f.controller.destroy();
            assert.strictEqual(f.el._handlers.mousedown.length, 0);
            assert.strictEqual(f.el._handlers.touchstart.length, 0);
            assert.strictEqual(f.doc._handlers.mousemove.length, 0);
            assert.strictEqual(f.doc._handlers.mouseup.length, 0);
            // Повторный mousedown — без эффекта
            f.el._fire('mousedown', profiles.event.modern({type: 'mousedown', target: f.el, pageX: 1, pageY: 1}));
            assert.strictEqual(f.log.start.length, 1);
        });
    });
})();
