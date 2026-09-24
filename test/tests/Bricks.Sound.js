(function() {
    //#imports
    describe('Bricks.Sound (браузерные профили: doc)', function() {
        var profiles = BricksTest.Profiles;

        // Bricks.Sound — синглтон (new Bricks.Component, а не конструктор):
        // new Bricks.Sound невозможен, экземпляр с другим doc создать нельзя
        // (контракт — продуктовое решение). Тесты переиспользуют общий
        // экземпляр: withDoc временно подменяет sound.doc (восстановление в
        // finally). Кэш _cache живёт на синглтоне — fname уникальные.
        var sound = Bricks.Sound;
        var withDoc = function(form, fn) {
            var saved = sound.doc;
            try {
                sound.doc = profiles.doc[form]();
                fn();
            } finally {
                sound.doc = saved;
            }
        };

        describe('isSupported', function() {
            var expectations = {
                modern: true,   // audio
                ie: true,       // bgsound
                quirks: true,   // bgsound
                ancient: false  // ни audio, ни bgsound
            };
            Object.keys(expectations).forEach(function(form) {
                it('[' + form + '] document', function() {
                    withDoc(form, function() {
                        assert.strictEqual(sound.isSupported(), expectations[form]);
                    });
                });
            });
            it('без подмены — injected (modern) document', function() {
                assert.strictEqual(sound.isSupported(), true);
            });
        });

        describe('audio-ветка (modern)', function() {
            // Парсинг innerHTML (firstChild у контейнера) — реальный DOM,
            // Yaxy-батч 3; в Node-профиле innerHTML не парсится, поэтому
            // play() не вызывается (audioEl — undefined), а факт работы
            // проверяется добавлением элемента в body.
            it('preload → элемент в body, кэш по fname; повтор — один, другой fname — два', function() {
                withDoc('modern', function() {
                    sound.preload('a1');
                    assert.strictEqual(typeof sound._cache.a1, 'function');
                    assert.strictEqual(sound.doc.body._children.length, 1);
                    sound.preload('a1');
                    assert.strictEqual(sound.doc.body._children.length, 1);
                    sound.preload('a2');
                    assert.strictEqual(sound.doc.body._children.length, 2);
                });
            });
        });

        describe('bgsound-ветка (IE)', function() {
            it('src — лениво (на play), элемент в head, кэш по fname', function() {
                withDoc('ie', function() {
                    sound.preload('bg1');
                    var el = sound.doc.head._children[0];
                    assert.ok(el);
                    assert.strictEqual(el.src, '');
                    sound.play('bg1');
                    assert.strictEqual(el.src, 'bg1.mp3');
                    // Кэш: повторный play — тот же элемент.
                    sound.play('bg1');
                    assert.strictEqual(sound.doc.head._children.length, 1);
                    // Другой fname — новый элемент.
                    sound.play('bg2');
                    assert.strictEqual(sound.doc.head._children.length, 2);
                    assert.strictEqual(sound.doc.head._children[1].src, 'bg2.mp3');
                });
            });
        });

        describe('звук недоступен (ancient)', function() {
            it('preload/play — noop, исключений и элементов нет', function() {
                withDoc('ancient', function() {
                    sound.preload('quiet');
                    assert.strictEqual(typeof sound._cache.quiet, 'function');
                    sound.play('quiet'); // не бросает
                    assert.strictEqual(sound.doc.body._children.length, 0);
                    assert.strictEqual(sound.doc.head._children.length, 0);
                });
            });
        });

        // Фикс батч 2: _initComponent не вызывал базовый — destroy() падал
        // на this._eventsController.unAll() (undefined).
        it('destroy — снимает подписки и посылает событие destroy', function() {
            var destroyed = 0;
            var handler = function() {
                destroyed++;
            };
            sound.addEventListener('destroy', handler);
            try {
                sound.destroy();
                assert.strictEqual(destroyed, 1);
            } finally {
                sound.removeEventListener('destroy', handler);
            }
        });
    });
})();
