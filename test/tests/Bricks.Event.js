(function() {
    //#imports
    describe('Bricks.Event', function() {
        // Формы объекта события — инлайновые литералы: интерфейс события —
        // вход нормализации (ADR 0003). Общие профили (Profiles.event)
        // появятся в батче 2 вместе с DOM-дерево-функциями.

        describe('getTarget', function() {
            it('evt.target (современные браузеры)', function() {
                var target = {tagName: 'DIV'};
                var evt = {target: target};
                assert.strictEqual(Bricks.Event.getTarget(evt), target);
            });

            it('evt.srcElement (IE < 9)', function() {
                var target = {tagName: 'DIV'};
                var evt = {srcElement: target};
                assert.strictEqual(Bricks.Event.getTarget(evt), target);
            });

            it('оба свойства — приоритет у target', function() {
                var target = {tag: 'target'};
                var srcElement = {tag: 'srcElement'};
                var evt = {target: target, srcElement: srcElement};
                assert.strictEqual(Bricks.Event.getTarget(evt), target);
            });

            it('ни target, ни srcElement — undefined', function() {
                assert.equal(Bricks.Event.getTarget({}), undefined);
            });

            // getTarget(evt, selector) и getPos — DOM-дерево: батч 2.
        });

        describe('stop', function() {
            it('современный объект: preventDefault + stopPropagation', function() {
                var evt = {
                    returnValue: undefined,
                    preventDefault: function() {
                        this.returnValue = false;
                    },
                    stopPropagation: function() {
                        this.propagationStopped = true;
                    }
                };
                Bricks.Event.stop(evt);
                assert.equal(evt.returnValue, false);
                assert.equal(evt.propagationStopped, true);
            });

            it('legacy-объект (IE < 9): returnValue + cancelBubble', function() {
                var evt = {};
                Bricks.Event.stop(evt);
                assert.equal(evt.returnValue, false);
                assert.equal(evt.cancelBubble, true);
            });

            // Смешанная форма (preventDefault без stopPropagation) реальными
            // браузерами не даётся — ветка кода недоступна, не тестируем.
        });

        describe('isLeftClick', function() {
            it('which == 1 (современные)', function() {
                assert.ok(Bricks.Event.isLeftClick({which: 1}));
            });

            it('button == 1 (IE)', function() {
                assert.ok(Bricks.Event.isLeftClick({button: 1}));
            });

            it('правая кнопка (both == 2) — false', function() {
                assert.ok(!Bricks.Event.isLeftClick({which: 2, button: 2}));
            });

            it('середина (button == 4) — false', function() {
                assert.ok(!Bricks.Event.isLeftClick({button: 4}));
            });

            it('пустой объект — false', function() {
                assert.ok(!Bricks.Event.isLeftClick({}));
            });
        });
    });
})();