(function() {
    //#imports
    describe('Bricks.DOM листья (браузерные профили: doc, el)', function() {
        var profiles = BricksTest.Profiles;

        // Ключовая переменная: в каких формах какой источник геометрии.
        // modern — окно с pageXOffset/innerWidth (стандарт); ie/quirks — окно
        // без pageXOffset, со standard/compat-режимом; ancient — раннее окно
        // (не ни innerWidth, ни pageXOffset).
        var docForms = ['modern', 'ie', 'quirks', 'ancient'];
        var elForms = ['modern', 'legacy', 'ancient'];

        describe('getWindow', function() {
            var viewSource = {
                modern: 'defaultView',
                ie: 'parentWindow',
                quirks: 'parentWindow',
                ancient: 'parentWindow'
            };
            docForms.forEach(function(form) {
                it('[' + form + '] возвращает окно формы', function() {
                    var doc = profiles.doc[form]();
                    assert.strictEqual(Bricks.DOM.getWindow(doc), doc[viewSource[form]]);
                });
            });
            it('без аргумента — окно текущего (injected modern) документа', function() {
                assert.strictEqual(Bricks.DOM.getWindow(), document.defaultView);
            });
        });

        describe('getRootElement', function() {
            var rootSource = {
                modern: 'documentElement',
                ie: 'documentElement',
                quirks: 'body',
                ancient: 'documentElement'
            };
            docForms.forEach(function(form) {
                it('[' + form + '] ' + rootSource[form], function() {
                    var doc = profiles.doc[form]();
                    assert.strictEqual(Bricks.DOM.getRootElement(doc), doc[rootSource[form]]);
                });
            });
            it('без аргумента — documentElement injected modern документа', function() {
                assert.strictEqual(Bricks.DOM.getRootElement(), document.documentElement);
            });
        });

        describe('getDocumentScroll', function() {
            it('[modern] источник — win.pageXOffset (мутация с восстановлением)', function() {
                var doc = profiles.doc.modern();
                try {
                    doc.defaultView.pageXOffset = 999;
                    doc.defaultView.pageYOffset = 888;
                    assert.deepEqual(Bricks.DOM.getDocumentScroll(doc), [999, 888]);
                } finally {
                    doc.defaultView.pageXOffset = 0;
                    doc.defaultView.pageYOffset = 0;
                }
            });
            it('[modern] win 0 → fallback на documentElement', function() {
                var doc = profiles.doc.modern();
                try {
                    doc.documentElement.scrollLeft = 55;
                    doc.documentElement.scrollTop = 44;
                    assert.deepEqual(Bricks.DOM.getDocumentScroll(doc), [55, 44]);
                } finally {
                    doc.documentElement.scrollLeft = 0;
                    doc.documentElement.scrollTop = 0;
                }
            });
            it('[modern] всё 0 → [0, 0]', function() {
                assert.deepEqual(Bricks.DOM.getDocumentScroll(profiles.doc.modern()), [0, 0]);
            });
            it('[ie] без pageXOffset — носитель documentElement (body не скроллится)', function() {
                var doc = profiles.doc.ie({scroll: [33, 44]});
                assert.deepEqual(Bricks.DOM.getDocumentScroll(doc), [33, 44]);
            });
            it('[quirks] без pageXOffset — носитель body (documentElement не скроллится)', function() {
                var doc = profiles.doc.quirks({scroll: [33, 44]});
                assert.deepEqual(Bricks.DOM.getDocumentScroll(doc), [33, 44]);
            });
            it('[ancient] окно без pageXOffset — носитель documentElement', function() {
                var doc = profiles.doc.ancient({scroll: [33, 44]});
                assert.deepEqual(Bricks.DOM.getDocumentScroll(doc), [33, 44]);
            });
            it('без аргумента — injected документ (мутация с восстановлением)', function() {
                var de = document.documentElement;
                try {
                    de.scrollLeft = 999;
                    de.scrollTop = 888;
                    assert.deepEqual(Bricks.DOM.getDocumentScroll(), [999, 888]);
                } finally {
                    de.scrollLeft = 0;
                    de.scrollTop = 0;
                }
            });
        });

        describe('getViewportSize', function() {
            it('[modern] окно больше client* → размеры окна', function() {
                var doc = profiles.doc.modern({clientWidth: 800, clientHeight: 600});
                assert.deepEqual(Bricks.DOM.getViewportSize(doc), [1024, 768]);
            });
            it('[modern] client* больше окна → размеры client*', function() {
                var doc = profiles.doc.modern({innerWidth: 500, innerHeight: 400});
                assert.deepEqual(Bricks.DOM.getViewportSize(doc), [1024, 768]);
            });
            it('[ie] та же механика (окно в ветке ||)', function() {
                var doc = profiles.doc.ie({clientWidth: 800, clientHeight: 600});
                assert.deepEqual(Bricks.DOM.getViewportSize(doc), [1024, 768]);
            });
            it('[quirks] корень — body: client* читаются с body', function() {
                var doc = profiles.doc.quirks({clientWidth: 800, clientHeight: 600});
                assert.deepEqual(Bricks.DOM.getViewportSize(doc), [1024, 768]);
            });
            // Раннее окно не имеет innerWidth (свойство появилось в IE6):
            // без || 0 Math.max выдавал NaN (батч 2: фикс).
            it('[ancient] окно без innerWidth → размеры client*, не NaN', function() {
                var doc = profiles.doc.ancient({clientWidth: 800, clientHeight: 600});
                assert.deepEqual(Bricks.DOM.getViewportSize(doc), [800, 600]);
            });
        });

        describe('getDocumentSize', function() {
            it('[modern] контент больше вьюпорта → размеры контента', function() {
                var doc = profiles.doc.modern({
                    clientWidth: 800, clientHeight: 600,
                    scrollWidth: 2000, scrollHeight: 1500
                });
                assert.deepEqual(Bricks.DOM.getDocumentSize(doc), [2000, 1500]);
            });
            it('[modern] контент меньше вьюпорта → размеры вьюпорта', function() {
                var doc = profiles.doc.modern({scrollWidth: 500, scrollHeight: 500});
                assert.deepEqual(Bricks.DOM.getDocumentSize(doc), [1024, 768]);
            });
            it('[quirks] scroll* читаются с body (корень)', function() {
                var doc = profiles.doc.quirks({scrollWidth: 2000, scrollHeight: 500});
                assert.deepEqual(Bricks.DOM.getDocumentSize(doc), [2000, 768]);
            });
            it('[ancient] без innerWidth — max(client*, scroll*)', function() {
                var doc = profiles.doc.ancient({
                    clientWidth: 800, clientHeight: 600,
                    scrollWidth: 500, scrollHeight: 500
                });
                assert.deepEqual(Bricks.DOM.getDocumentSize(doc), [800, 600]);
            });
        });

        describe('getPos', function() {
            // rect-ветка: box + scroll − clientLeft/Top. Формы el различаются
            // наличием getBoundingClientRect, формы doc — источником скролла
            // и корня (std/quirks). Ожидание одинаковое — нормализация.
            var makeRectCase = function(elForm, docForm) {
                return function() {
                    var doc = profiles.doc[docForm]({scroll: [100, 50], clientLeft: 2, clientTop: 3});
                    var el = profiles.el[elForm]('', {ownerDocument: doc, rect: {left: 10, top: 20}});
                    assert.deepEqual(Bricks.DOM.getPos(el), [108, 67]);
                };
            };
            docForms.forEach(function(docForm) {
                it('rect-ветка: [modern el × ' + docForm + ' doc]', makeRectCase('modern', docForm));
            });
            it('rect-ветка: [legacy el × modern doc]', makeRectCase('legacy', 'modern'));

            // offset-цепочка (до-rect браузеры): сумма offsetLeft/offsetTop
            // по цепочке offsetParent. Документ ветке не нужен.
            it('offset-цепочка: 3 уровня суммируются', function() {
                var grand = profiles.el.ancient('grand', {offsetLeft: 5, offsetTop: 7});
                var mid = profiles.el.ancient('mid', {offsetLeft: 15, offsetTop: 23, offsetParent: grand});
                var box = profiles.el.ancient('box', {offsetLeft: 25, offsetTop: 41, offsetParent: mid});
                assert.deepEqual(Bricks.DOM.getPos(box), [45, 71]);
            });
            it('offset-цепочка: одиночный элемент (offsetParent null)', function() {
                var box = profiles.el.ancient('box', {offsetLeft: 9, offsetTop: 3});
                assert.deepEqual(Bricks.DOM.getPos(box), [9, 3]);
            });
        });

        describe('isAncestor', function() {
            var cases = [
                ['строгой потомок (grand → child)', function(t) { return [t.grand, t.child, true]; }],
                ['прямой потомок (grand → mid)', function(t) { return [t.grand, t.mid, true]; }],
                ['обратное (child → grand)', function(t) { return [t.child, t.grand, false]; }],
                ['братья', function(t) { return [t.child, t.sibling, false]; }],
                ['разъединённое поддерево', function(t) { return [t.grand, t.foreign, false]; }],
                // Фикс батч 2: CDP-ветка для self была false (по спецификации
                // compareDocumentPosition(self) = 0), а contains/цепочка — true.
                // Теперь self → true во всех ветках.
                ['el сам себе — true (единообразие веток)', function(t) { return [t.grand, t.grand, true]; }]
            ];
            elForms.forEach(function(form) {
                cases.forEach(function(c) {
                    it('[' + form + '] ' + c[0], function() {
                        var make = profiles.el[form];
                        var grand = make('grand');
                        var tree = {
                            grand: grand,
                            mid: make('mid', {parentNode: grand}),
                            child: make('child'),
                            sibling: make('sibling'),
                            foreign: make('foreign', {parentNode: make('other-root')})
                        };
                        tree.child.parentNode = tree.mid;
                        tree.sibling.parentNode = tree.mid;
                        var args = c[1](tree);
                        assert.strictEqual(Bricks.DOM.isAncestor(args[0], args[1]), args[2]);
                    });
                });
            });
        });
    });
})();
