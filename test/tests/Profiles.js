(function() {
    //#imports
    describe('Profiles: conformance браузерных профилей (без вызовов lib)', function() {
        var profiles = BricksTest.Profiles;

        describe('el', function() {
            it('modern: classList + contains + getBoundingClientRect + event-sink', function() {
                var el = profiles.el.modern('a b');
                assert.ok(el.classList && el.contains && el.getBoundingClientRect);
                assert.ok(el.addEventListener && el.removeEventListener && el._fire);
                assert.ok(el.classList.contains('a'));
                assert.deepEqual(el.getBoundingClientRect(), {left: 0, top: 0});
            });
            it('legacy: без classList; compareDocumentPosition; без contains', function() {
                var el = profiles.el.legacy('a');
                assert.strictEqual(el.classList, undefined);
                assert.strictEqual(typeof el.compareDocumentPosition, 'function');
                assert.strictEqual(el.contains, undefined);
            });
            it('ancient: ни classList, ни contains, ни compareDocumentPosition, ни rect', function() {
                var el = profiles.el.ancient('a');
                assert.strictEqual(el.classList, undefined);
                assert.strictEqual(el.contains, undefined);
                assert.strictEqual(el.compareDocumentPosition, undefined);
                assert.strictEqual(el.getBoundingClientRect, undefined);
            });
            // Биты описывают положение other относительно this (this —
            // элемент, над которым вызван метод): 16 (CONTAINED_BY) — other
            // потомок, 8 (CONTAINS) — other предок. Именно так читает ветку
            // lib (parent.compareDocumentPosition(child) & 16).
            it('compareDocumentPosition: self 0, потомок-other 16, предок-other 8, прочее 0', function() {
                var grand = profiles.el.legacy('grand');
                var child = profiles.el.legacy('child', {parentNode: grand});
                // «Прочее» — разъединённый элемент: ни предок, ни потомок.
                var foreign = profiles.el.legacy('foreign');
                assert.strictEqual(grand.compareDocumentPosition(grand), 0);
                assert.strictEqual(grand.compareDocumentPosition(child), 16);
                assert.strictEqual(child.compareDocumentPosition(grand), 8);
                assert.strictEqual(grand.compareDocumentPosition(foreign), 0);
            });
            it('svg: className — объект, значение — в атрибуте', function() {
                var el = profiles.el.svg('a b');
                assert.strictEqual(typeof el.className, 'object');
                assert.strictEqual(el.getAttribute('class'), 'a b');
                el.setAttribute('class', 'c');
                assert.strictEqual(el.getAttribute('class'), 'c');
            });
        });

        describe('style', function() {
            var keysets = {
                modern: ['opacity', 'cssFloat', 'display', 'borderRadius'],
                ie8: ['styleFloat', 'display'],
                ie10: ['opacity', 'styleFloat', 'display', '-ms-flex', '-ms-borderRadius'],
                moz: ['opacity', 'cssFloat', 'display', 'MozBorderRadius'],
                webkit: ['opacity', 'cssFloat', 'display', 'WebkitBorderRadius'],
                o: ['opacity', 'cssFloat', 'display', 'OBorderRadius']
            };
            Object.keys(keysets).forEach(function(form) {
                it('[' + form + '] ровно задокументированный набор свойств', function() {
                    var expected = keysets[form].slice().sort();
                    var actual = Object.keys(profiles.style[form]()).sort();
                    assert.deepEqual(actual, expected);
                });
            });
        });

        describe('doc', function() {
            var expected = {
                modern: {compatMode: 'CSS1Compat', hasInner: true, hasPageXOffset: true, audio: true, bgsound: false},
                ie: {compatMode: 'CSS1Compat', hasInner: true, hasPageXOffset: false, audio: false, bgsound: true},
                quirks: {compatMode: 'BackCompat', hasInner: true, hasPageXOffset: false, audio: false, bgsound: true},
                ancient: {compatMode: 'CSS1Compat', hasInner: false, hasPageXOffset: false, audio: false, bgsound: false}
            };
            Object.keys(expected).forEach(function(form) {
                var e = expected[form];
                it('[' + form + '] compatMode и окно', function() {
                    var doc = profiles.doc[form]();
                    assert.strictEqual(doc.compatMode, e.compatMode);
                    var win = doc.parentWindow || doc.defaultView;
                    assert.ok(win);
                    assert.ok(('innerWidth' in win) === e.hasInner);
                    assert.ok(('pageXOffset' in win) === e.hasPageXOffset);
                });
                it('[' + form + '] звуковые элементы в createElement', function() {
                    var doc = profiles.doc[form]();
                    assert.ok(('src' in doc.createElement('audio')) === e.audio);
                    assert.ok(('src' in doc.createElement('bgsound')) === e.bgsound);
                });
            });
            it('[modern] скролл на documentElement и body; view — defaultView', function() {
                var doc = profiles.doc.modern({scroll: [7, 8]});
                assert.strictEqual(doc.documentElement.scrollLeft, 7);
                assert.strictEqual(doc.body.scrollLeft, 7);
                assert.ok(doc.defaultView.pageXOffset === 7);
                assert.strictEqual(doc.parentWindow, undefined);
            });
            it('[ie] скролл на documentElement (body — нет); view — parentWindow и defaultView', function() {
                var doc = profiles.doc.ie({scroll: [7, 8]});
                assert.strictEqual(doc.documentElement.scrollLeft, 7);
                assert.strictEqual(doc.body.scrollLeft, 0);
                assert.strictEqual(doc.parentWindow, doc.defaultView);
            });
            it('[quirks] скролл на body (documentElement — нет)', function() {
                var doc = profiles.doc.quirks({scroll: [7, 8]});
                assert.strictEqual(doc.documentElement.scrollLeft, 0);
                assert.strictEqual(doc.body.scrollLeft, 7);
            });
            it('sink-интерфейс (addEventListener/removeEventListener/_fire)', function() {
                var doc = profiles.doc.modern();
                var hits = [];
                var fn = function() {
                    hits.push(1);
                };
                doc.addEventListener('x', fn);
                doc._fire('x', {});
                assert.strictEqual(hits.length, 1);
                doc.removeEventListener('x', fn);
                doc._fire('x', {});
                assert.strictEqual(hits.length, 1);
            });
            it('getElementsByTagName("head") — [head]; getElementById — null', function() {
                var doc = profiles.doc.modern();
                assert.deepEqual(doc.getElementsByTagName('head'), [doc.head]);
                assert.strictEqual(doc.getElementById('nope'), null);
            });
        });

        describe('event', function() {
            it('modern: target/pageX/clientX/preventDefault/stopPropagation', function() {
                var evt = profiles.event.modern({target: {}, clientX: 1, pageX: 2});
                assert.ok(evt.target && evt.pageX === 2 && evt.clientX === 1);
                assert.ok(evt.preventDefault && evt.stopPropagation);
                evt.preventDefault();
                evt.stopPropagation();
                assert.strictEqual(evt.defaultPrevented, true);
                assert.strictEqual(evt.propagationStopped, true);
            });
            it('ie8: srcElement + clientX; нет target/pageX/preventDefault', function() {
                var sentinel = {};
                var evt = profiles.event.ie8({target: sentinel, clientX: 1});
                assert.strictEqual(evt.srcElement, sentinel);
                assert.strictEqual(evt.target, undefined);
                assert.strictEqual(evt.pageX, undefined);
                assert.strictEqual(evt.preventDefault, undefined);
                assert.strictEqual(typeof evt.button, 'number');
            });
            it('touch: touches[] как контейнер координат', function() {
                var evt = profiles.event.touch({touches: [{pageX: 5}]});
                assert.strictEqual(evt.touches.length, 1);
                assert.strictEqual(evt.touches[0].pageX, 5);
            });
        });

        describe('xhr', function() {
            it('интерфейс: open/setRequestHeader/send/getResponseHeader/onreadystatechange', function() {
                var xhr = new profiles.xhr();
                assert.strictEqual(xhr.readyState, 0);
                ['open', 'setRequestHeader', 'send', 'getResponseHeader'].forEach(function(name) {
                    assert.strictEqual(typeof xhr[name], 'function');
                });
            });
            it('open фиксирует метод/URL/async, readyState 1', function() {
                var xhr = new profiles.xhr();
                xhr.open('GET', '/api?a=1', true);
                assert.strictEqual(xhr.readyState, 1);
                assert.strictEqual(xhr._method, 'GET');
                assert.strictEqual(xhr._url, '/api?a=1');
                assert.strictEqual(xhr._async, true);
            });
            it('headers: set — case-normalized, get — case-insensitive, промах — null', function() {
                var xhr = new profiles.xhr();
                xhr.open('GET', '/api', true);
                xhr.setRequestHeader('X-Mixed-Case', 'v');
                assert.strictEqual(xhr._reqHeaders['x-mixed-case'], 'v');
                xhr._respHeaders['content-type'] = 'application/json';
                assert.strictEqual(xhr.getResponseHeader('Content-Type'), 'application/json');
                assert.strictEqual(xhr.getResponseHeader('nope'), null);
            });
            it('send: синхронное завершение — readyState 4, статус/текст из конфига, onreadystatechange', function() {
                var xhr = new profiles.xhr();
                xhr.open('POST', '/api', true);
                var called = 0;
                xhr.onreadystatechange = function() {
                    called++;
                };
                xhr.send('body');
                assert.strictEqual(xhr.readyState, 4);
                assert.strictEqual(called, 1);
                assert.strictEqual(xhr.status, 200); // дефолт
                assert.strictEqual(xhr._body, 'body');
            });
            it('configure захватывается при конструировании (до send)', function() {
                profiles.xhr.configure({status: 500, responseText: 'boom'});
                var xhr = new profiles.xhr();
                xhr.open('GET', '/api', true);
                xhr.send(null);
                assert.strictEqual(xhr.status, 500);
                assert.strictEqual(xhr.responseText, 'boom');
            });
            it('ActiveXObject: чужой тип — исключение', function() {
                assert.throws(function() {
                    profiles.xhr.activex('Microsoft.XMLHTTP');
                }, /unknown ActiveXObject type/);
                assert.strictEqual(typeof profiles.xhr.activex('Msxml2.XMLHTTP'), 'object');
            });
        });
    });
})();
