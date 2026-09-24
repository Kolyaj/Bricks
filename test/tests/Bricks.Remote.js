(function() {
    //#imports
    describe('Bricks.Remote (браузерные профили: xhr)', function() {
        var profiles = BricksTest.Profiles;
        var xhrCtor = profiles.xhr;

        // lib: window.XMLHttpRequest ? new XMLHttpRequest() : new
        // ActiveXObject('Msxml2.XMLHTTP'). XMLHttpRequest не входит в список
        // инъекций — свободная переменная резолвится в globalThis;
        // window/ActiveXObject — инъекты. withXHR переключает обе точки и
        // восстанавливает их в finally (globalThis — общий для прохода).
        var withXHR = function(kind, fn) {
            var saved = {
                windowXhr: window.XMLHttpRequest,
                globalXhr: globalThis.XMLHttpRequest,
                activeX: ActiveXObject
            };
            try {
                if (kind === 'native') {
                    window.XMLHttpRequest = xhrCtor;
                    globalThis.XMLHttpRequest = xhrCtor;
                    ActiveXObject = undefined;
                } else {
                    window.XMLHttpRequest = undefined;
                    globalThis.XMLHttpRequest = undefined;
                    ActiveXObject = xhrCtor.activex;
                }
                fn();
            } finally {
                window.XMLHttpRequest = saved.windowXhr;
                globalThis.XMLHttpRequest = saved.globalXhr;
                ActiveXObject = saved.activeX;
            }
        };

        describe('_createXHRObject: полный flow', function() {
            ['native', 'activex'].forEach(function(kind) {
                it('[' + kind + '] GET: open/headers/send/ответ', function() {
                    withXHR(kind, function() {
                        xhrCtor.configure({
                            status: 200,
                            responseText: '{"ok":true}',
                            responseHeaders: {'Content-Type': 'application/json'}
                        });
                        var remote = new Bricks.Remote({getParams: {a: 1}});
                        var got;
                        remote.get('/api', {b: 2, a: 9}, function(data, xhr) {
                            got = {data: data, xhr: xhr};
                        });
                        assert.strictEqual(got.xhr._method, 'GET');
                        assert.strictEqual(got.xhr._url, '/api?a=9&b=2');
                        assert.strictEqual(got.xhr._async, true);
                        assert.strictEqual(got.xhr._body, null);
                        assert.deepEqual(got.data, {ok: true});
                    });
                });
            });
        });

        describe('request: параметры', function() {
            it('call-параметры переопределяют instance (a=9, ключ order instance)', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote({getParams: {a: 1}});
                    var got;
                    remote.get('/api', {b: 2, a: 9}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._url, '/api?a=9&b=2');
                });
            });
            it('url уже содержит ? — дописывается &', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    var got;
                    remote.get('/api?x=1', {y: 2}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._url, '/api?x=1&y=2');
                });
            });
            it('параметры кодируются', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    var got;
                    remote.get('/api', {q: 'a b', s: 'x&y'}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._url, '/api?q=a%20b&s=x%26y');
                });
            });
            it('setGetParam — reflected в request', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    remote.setGetParam('k', 'v');
                    var got;
                    remote.get('/api', null, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._url, '/api?k=v');
                });
            });
        });

        describe('request: headers', function() {
            it('instance + per-call; при коллизии выигрывает per-call (симметрия с params)', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote({headers: {'X-Api-Key': 'instance'}});
                    var got;
                    remote.request('GET', '/api', null, null, {'X-Api-Key': 'call', 'X-Other': 'o'}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._reqHeaders['x-api-key'], 'call');
                    assert.strictEqual(got._reqHeaders['x-other'], 'o');
                });
            });
            it('setHeader — reflected в request', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    remote.setHeader('X-Token', 't');
                    var got;
                    remote.get('/api', null, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._reqHeaders['x-token'], 't');
                });
            });
        });

        describe('request: body', function() {
            it('POST: Content-Type + закодированный body', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote({contentType: 'application/json'});
                    var got;
                    remote.post('/api', {a: 1, b: 'x y'}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._method, 'POST');
                    assert.strictEqual(got._reqHeaders['content-type'], 'application/json');
                    assert.strictEqual(got._body, 'a=1&b=x%20y');
                });
            });
            it('PUT: body тоже отправляется', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    var got;
                    remote.request('PUT', '/api', null, {a: 1}, null, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._method, 'PUT');
                    assert.strictEqual(got._body, 'a=1');
                });
            });
            it('setPostParam — instance-params в body (батч 2: фикс merge)', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    remote.setPostParam('k', 'v');
                    var got;
                    remote.post('/api', {q: 1}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._body, 'k=v&q=1');
                });
            });
            it('call-params переопределяют instance', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote({postParams: {a: 1}});
                    var got;
                    remote.post('/api', {a: 9}, function(data, xhr) {
                        got = xhr;
                    });
                    assert.strictEqual(got._body, 'a=9');
                });
            });
        });

        describe('request: ответ и callback', function() {
            it('статус ≠ 200 → data = null', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 500, responseText: 'boom'});
                    var remote = new Bricks.Remote();
                    var got;
                    remote.get('/api', null, function(data, xhr) {
                        got = {data: data, xhr: xhr};
                    });
                    assert.strictEqual(got.data, null);
                    assert.strictEqual(got.xhr.status, 500);
                });
            });
            it('callback вызывается в ctx', function() {
                withXHR('native', function() {
                    xhrCtor.configure({status: 200, responseText: '{}'});
                    var remote = new Bricks.Remote();
                    var ctx = {};
                    var seenThis;
                    remote.get('/api', null, function() {
                        seenThis = this;
                    }, ctx);
                    assert.strictEqual(seenThis, ctx);
                });
            });
        });

        describe('_parseResponse', function() {
            var makeRemote = function() {
                return new Bricks.Remote();
            };
            var xhrWith = function(opts) {
                var xhr = xhrCtor.make(opts);
                xhr.readyState = 4;
                // В реальном запросе responseText заполняется в send();
                // прямой вызов _parseResponse требует заполнить его явно.
                xhr.responseText = opts.responseText != null ? opts.responseText : '';
                return xhr;
            };
            it('application/json (+charset) — парсится', function() {
                var xhr = xhrWith({
                    responseText: '{"a":[1,2]}',
                    responseHeaders: {'Content-Type': 'application/json; charset=utf-8'}
                });
                assert.deepEqual(makeRemote()._parseResponse(xhr), {a: [1, 2]});
            });
            it('ISO-8601 строка в JSON → Date', function() {
                var xhr = xhrWith({
                    responseText: '{"d":"2026-01-02T03:04:05.000Z"}',
                    responseHeaders: {'Content-Type': 'application/json'}
                });
                var data = makeRemote()._parseResponse(xhr);
                assert.ok(data.d instanceof Date);
                assert.strictEqual(data.d.getTime(), new Date('2026-01-02T03:04:05.000Z').getTime());
            });
            it('не-ISO строка в JSON остаётся строкой', function() {
                var xhr = xhrWith({
                    responseText: '{"d":"2026-01-02"}',
                    responseHeaders: {'Content-Type': 'application/json'}
                });
                var data = makeRemote()._parseResponse(xhr);
                assert.strictEqual(data.d, '2026-01-02');
            });
            it('не-JSON Content-Type → сырой текст', function() {
                var xhr = xhrWith({
                    responseText: 'plain',
                    responseHeaders: {'Content-Type': 'text/plain'}
                });
                assert.strictEqual(makeRemote()._parseResponse(xhr), 'plain');
            });
            it('без Content-Type → сырой текст', function() {
                var xhr = xhrWith({responseText: 'plain'});
                assert.strictEqual(makeRemote()._parseResponse(xhr), 'plain');
            });
        });
    });
})();
