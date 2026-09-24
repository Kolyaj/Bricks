(function() {
    //#imports
    describe('Bricks.DOM DOM-дерево (реальный браузер)', function() {
        // DOM-дерево — механизм (ADR 0003): getElementById, getElementsByTagName,
        // innerHTML, реальная диспетчеризация событий — тесты работают только
        // в реальном браузере (Yaxy), а не на Node-профилях.
        // Каждый тест строит контейнер в документе и разбирает его в finally.
        var makeContainer = function() {
            var el = document.createElement('div');
            document.body.appendChild(el);
            return el;
        };

        var withContainer = function(name, fn) {
            it(name, function() {
                var container = makeContainer();
                try {
                    fn(container);
                } finally {
                    Bricks.DOM.remove(container);
                }
            });
        };

        describe('getEl', function() {
            withContainer('строковый id — элемент', function(container) {
                var el = document.createElement('div');
                el.id = 'bricksTestGetEl';
                container.appendChild(el);
                assert.strictEqual(Bricks.DOM.getEl('bricksTestGetEl'), el);
            });

            withContainer('несуществующий id — null', function() {
                assert.strictEqual(Bricks.DOM.getEl('bricksTestAbsent'), null);
            });

            withContainer('объект-элемент проходит как есть', function() {
                var el = document.createElement('div');
                assert.strictEqual(Bricks.DOM.getEl(el), el);
            });

            withContainer('falsy-аргументы — null', function() {
                assert.strictEqual(Bricks.DOM.getEl(null), null);
                assert.strictEqual(Bricks.DOM.getEl(undefined), null);
                assert.strictEqual(Bricks.DOM.getEl(''), null);
            });

            withContainer('явный параметр doc', function(container) {
                var el = document.createElement('div');
                el.id = 'bricksTestGetElDoc';
                container.appendChild(el);
                assert.strictEqual(Bricks.DOM.getEl('bricksTestGetElDoc', document), el);
            });
        });

        describe('createSelectorFilter', function() {
            withContainer('тег: в любом регистре селектора', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                assert.ok(Bricks.DOM.createSelectorFilter('div')(el));
                assert.ok(Bricks.DOM.createSelectorFilter('DIV')(el));
                var span = document.createElement('span');
                container.appendChild(span);
                assert.ok(!Bricks.DOM.createSelectorFilter('div')(span));
            });

            withContainer('тег.класс: граница слова в многотокенном классе', function(container) {
                var el = document.createElement('div');
                el.className = 'alpha beta';
                container.appendChild(el);
                var filter = Bricks.DOM.createSelectorFilter('div.alpha');
                assert.ok(filter(el));
                var el2 = document.createElement('div');
                el2.className = 'gamma alpha delta';
                container.appendChild(el2);
                assert.ok(filter(el2));
                var el3 = document.createElement('div');
                el3.className = 'alphabet';
                container.appendChild(el3);
                assert.ok(!filter(el3));
                var el4 = document.createElement('div');
                el4.className = 'al phabet';
                container.appendChild(el4);
                assert.ok(!filter(el4));
            });

            withContainer('класс без тега', function(container) {
                var div = document.createElement('div');
                div.className = 'bricksTestClass';
                var span = document.createElement('span');
                span.className = 'bricksTestClass';
                container.appendChild(div);
                container.appendChild(span);
                var filter = Bricks.DOM.createSelectorFilter('.bricksTestClass');
                assert.ok(filter(div));
                assert.ok(filter(span));
            });

            it('кэш: один и тот же селектор — одна и та же функция', function() {
                assert.strictEqual(
                    Bricks.DOM.createSelectorFilter('bricksTestFilterCache'),
                    Bricks.DOM.createSelectorFilter('bricksTestFilterCache')
                );
            });
        });

        describe('getEls', function() {
            withContainer('тег', function(container) {
                container.innerHTML = '<span>a</span><div>b</div><span>c</span>';
                var divs = Bricks.DOM.getEls('div', container);
                assert.equal(divs.length, 1);
                assert.equal(divs[0].textContent, 'b');
                assert.equal(Bricks.DOM.getEls('span', container).length, 2);
            });

            withContainer('тег.класс', function(container) {
                container.innerHTML = '<div class="x">1</div><div class="x y">2</div><div class="y">3</div>';
                var result = Bricks.DOM.getEls('div.x', container);
                assert.equal(result.length, 2);
                assert.strictEqual(result[0].textContent, '1');
                assert.strictEqual(result[1].textContent, '2');
            });

            withContainer('префикс ! — первый элемент', function(container) {
                container.innerHTML = '<div class="x">1</div><div class="x">2</div>';
                assert.strictEqual(Bricks.DOM.getEls('!div.x', container).textContent, '1');
            });

            withContainer('префикс !, ничего не найдено — null', function(container) {
                assert.strictEqual(Bricks.DOM.getEls('!div.bricksTestAbsent', container), null);
            });

            withContainer('ничего не найдено — пустой массив', function(container) {
                container.innerHTML = '<div>1</div>';
                assert.deepEqual(Bricks.DOM.getEls('table', container), []);
            });

            withContainer('parents — массив двух узлов: ищутся оба', function(container) {
                var c1 = document.createElement('div');
                c1.innerHTML = '<i class="x">1</i>';
                var c2 = document.createElement('div');
                c2.innerHTML = '<i class="x">2</i>';
                container.appendChild(c1);
                container.appendChild(c2);
                var result = Bricks.DOM.getEls('i.x', [c1, c2]);
                assert.equal(result.length, 2);
                assert.strictEqual(result[0].textContent, '1');
                assert.strictEqual(result[1].textContent, '2');
            });

            withContainer('parents — строковый id', function(container) {
                container.id = 'bricksTestGetEls';
                container.innerHTML = '<b class="x">1</b>';
                assert.equal(Bricks.DOM.getEls('b.x', container.id).length, 1);
            });

            withContainer('parents не указаны — весь документ', function(container) {
                container.innerHTML = '<em class="bricksTestDocEls">1</em>';
                var result = Bricks.DOM.getEls('em.bricksTestDocEls');
                assert.equal(result.length, 1);
                assert.strictEqual(result[0], container.firstChild);
            });
        });

        describe('remove', function() {
            withContainer('элемент с родителем', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                Bricks.DOM.remove(el);
                assert.strictEqual(el.parentNode, null);
                assert.strictEqual(container.firstChild, null);
            });

            withContainer('элемент без родителя — без ошибок', function() {
                var el = document.createElement('div');
                Bricks.DOM.remove(el);
            });

            withContainer('строковый id', function(container) {
                var el = document.createElement('div');
                el.id = 'bricksTestRemove';
                container.appendChild(el);
                Bricks.DOM.remove('bricksTestRemove');
                assert.strictEqual(container.firstChild, null);
            });
        });

        describe('createFragment', function() {
            withContainer('несколько узлов — DocumentFragment', function(container) {
                var fragment = Bricks.DOM.createFragment('<b>1</b><i>2</i><u>3</u>');
                assert.equal(fragment.nodeType, document.DOCUMENT_FRAGMENT_NODE);
                assert.equal(fragment.childNodes.length, 3);
                container.appendChild(fragment);
                assert.equal(container.childNodes.length, 3);
                assert.strictEqual(container.firstChild.tagName, 'B');
                assert.strictEqual(container.lastChild.tagName, 'U');
                assert.strictEqual(container.firstChild.textContent, '1');
            });

            withContainer('пустая строка — пустой фрагмент', function() {
                assert.equal(Bricks.DOM.createFragment('').childNodes.length, 0);
            });

            withContainer('явный параметр doc', function() {
                assert.equal(Bricks.DOM.createFragment('<b>1</b>', document).childNodes.length, 1);
            });
        });

        describe('setStyle', function() {
            withContainer('объект стилей: имена через дефис, число → px', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                Bricks.DOM.setStyle(el, {
                    color: 'red',
                    'font-size': 12,
                    'margin-left': '1px'
                });
                assert.strictEqual(el.style.color, 'red');
                assert.strictEqual(el.style.fontSize, '12px');
                assert.strictEqual(el.style.marginLeft, '1px');
            });
        });

        describe('on / un', function() {
            var dispatch = function(el, type) {
                var evt = new MouseEvent(type, {bubbles: true, cancelable: true});
                el.dispatchEvent(evt);
                return evt;
            };

            withContainer('on: обработчик вызывается в контексте с событием', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                var ctx = {called: 0};
                var received;
                var fn = function(evt) {
                    this.called++;
                    received = evt;
                };
                Bricks.DOM.on(el, 'click', fn, ctx);
                var evt = dispatch(el, 'click');
                assert.equal(ctx.called, 1);
                assert.strictEqual(received, evt);
                Bricks.DOM.un(el, 'click', fn, ctx);
                dispatch(el, 'click');
                assert.equal(ctx.called, 1);
            });

            withContainer('несколько событий через запятую', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                var types = [];
                var fn = function(evt) {
                    types.push(evt.type);
                };
                Bricks.DOM.on(el, 'click,dblclick', fn);
                dispatch(el, 'click');
                dispatch(el, 'dblclick');
                assert.deepEqual(types, ['click', 'dblclick']);
                Bricks.DOM.un(el, 'click,dblclick', fn);
                dispatch(el, 'click');
                assert.deepEqual(types, ['click', 'dblclick']);
            });

            withContainer('unAll — все обработчики сняты', function(container) {
                var e1 = document.createElement('div');
                var e2 = document.createElement('div');
                container.appendChild(e1);
                container.appendChild(e2);
                var fn1 = function() { e1.hits = (e1.hits || 0) + 1; };
                var fn2 = function() { e2.hits = (e2.hits || 0) + 1; };
                Bricks.DOM.on(e1, 'click', fn1);
                Bricks.DOM.on(e2, 'click', fn2);
                dispatch(e1, 'click');
                dispatch(e2, 'click');
                Bricks.DOM.unAll();
                dispatch(e1, 'click');
                dispatch(e2, 'click');
                assert.equal(e1.hits, 1);
                assert.equal(e2.hits, 1);
            });
        });

        describe('initDrag', function() {
            var mouse = function(type, x, y) {
                return new MouseEvent(type, {clientX: x, clientY: y, bubbles: true, cancelable: true});
            };

            withContainer('mousedown → mousemove → mouseup: дельты, контекст, чистка слушателей', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                var calls = [];
                var ctx = {moves: 0};
                Bricks.DOM.initDrag(
                    el,
                    function() { calls.push('start'); },
                    function(delta) {
                        calls.push(['move', delta[0], delta[1]]);
                        this.moves++;
                    },
                    function() { calls.push('end'); },
                    ctx
                );
                el.dispatchEvent(mouse('mousedown', 100, 100));
                document.dispatchEvent(mouse('mousemove', 110, 120));
                document.dispatchEvent(mouse('mousemove', 105, 120));
                document.dispatchEvent(mouse('mouseup', 105, 120));
                document.dispatchEvent(mouse('mousemove', 999, 999));
                assert.equal(calls.length, 4);
                assert.strictEqual(calls[0], 'start');
                assert.deepEqual(calls[1], ['move', 10, 20]);
                assert.deepEqual(calls[2], ['move', -5, 0]);
                assert.strictEqual(calls[3], 'end');
                assert.equal(ctx.moves, 2);
            });

            withContainer('onStart вернул false — драга не началась', function(container) {
                var el = document.createElement('div');
                container.appendChild(el);
                var moves = 0;
                Bricks.DOM.initDrag(el, function() {
                    return false;
                }, function() {
                    moves++;
                });
                el.dispatchEvent(mouse('mousedown', 10, 10));
                document.dispatchEvent(mouse('mousemove', 50, 50));
                assert.equal(moves, 0);
            });

            if (typeof TouchEvent !== 'undefined' && typeof Touch !== 'undefined') {
                describe('touch', function() {
                    var oneTouch = function(el, x, y) {
                        return new Touch({identifier: 1, target: el, clientX: x, clientY: y, pageX: x, pageY: y});
                    };

                    withContainer('touchstart → touchmove → touchend', function(container) {
                        var el = document.createElement('div');
                        container.appendChild(el);
                        var moves = [];
                        Bricks.DOM.initDrag(
                            el,
                            function() {},
                            function(delta) { moves.push(delta); }
                        );
                        var t = oneTouch(el, 10, 10);
                        el.dispatchEvent(new TouchEvent('touchstart', {
                            touches: [t], changedTouches: [t], bubbles: true, cancelable: true
                        }));
                        var t2 = oneTouch(el, 20, 30);
                        document.dispatchEvent(new TouchEvent('touchmove', {
                            touches: [t2], changedTouches: [t2], bubbles: true, cancelable: true
                        }));
                        document.dispatchEvent(new TouchEvent('touchend', {
                            touches: [], changedTouches: [t2], bubbles: true, cancelable: true
                        }));
                        assert.equal(moves.length, 1);
                        assert.deepEqual(moves[0], [10, 20]);
                    });

                    withContainer('несколько пальцев — драга не началась', function(container) {
                        var el = document.createElement('div');
                        container.appendChild(el);
                        var moves = 0;
                        Bricks.DOM.initDrag(el, function() {}, function() {
                            moves++;
                        });
                        var t1 = new Touch({identifier: 1, target: el, clientX: 10, clientY: 10, pageX: 10, pageY: 10});
                        var t2 = new Touch({identifier: 2, target: el, clientX: 20, clientY: 20, pageX: 20, pageY: 20});
                        el.dispatchEvent(new TouchEvent('touchstart', {
                            touches: [t1, t2], changedTouches: [t1, t2], bubbles: true, cancelable: true
                        }));
                        document.dispatchEvent(new TouchEvent('touchmove', {
                            touches: [t1, t2], changedTouches: [t1, t2], bubbles: true, cancelable: true
                        }));
                        assert.equal(moves, 0);
                    });
                });
            }
        });
    });
})();
