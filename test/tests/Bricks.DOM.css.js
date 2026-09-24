(function() {
    //#imports
    describe('Bricks.DOM normalizeCSS* (браузерные профили: style)', function() {
        var styleProfiles = BricksTest.Profiles.style;

        // Эталон normalizeCSSProperty — el.style, если el передан, иначе
        // document.documentElement.style. Два способа задать эталон:
        //  1) elWithStyle(form) — псевдо-элемент с profile-стилем (не трогает
        //     общий injected document);
        //  2) withStyle(form) — временная подмена document.documentElement.style
        //     (только для тестов ветки без el), с восстановлением в finally.
        var elWithStyle = function(form) {
            return {style: styleProfiles[form]()};
        };
        var withStyle = function(form, fn) {
            var saved = document.documentElement.style;
            try {
                document.documentElement.style = styleProfiles[form]();
                fn();
            } finally {
                document.documentElement.style = saved;
            }
        };

        describe('normalizeCSSValue', function() {
            it('число → px', function() {
                assert.strictEqual(Bricks.DOM.normalizeCSSValue(12.5), '12.5px');
            });
            it('0 → "0px" (не "")', function() {
                assert.strictEqual(Bricks.DOM.normalizeCSSValue(0), '0px');
            });
            it('null → ""', function() {
                assert.strictEqual(Bricks.DOM.normalizeCSSValue(null), '');
            });
            it('undefined → ""', function() {
                assert.strictEqual(Bricks.DOM.normalizeCSSValue(undefined), '');
            });
            it('строка — как есть', function() {
                assert.strictEqual(Bricks.DOM.normalizeCSSValue('red'), 'red');
            });
        });

        describe('normalizeCSSProperty: opacity', function() {
            it('[modern] без преобразований', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', '0.5', elWithStyle('modern')), ['opacity', '0.5']);
            });
            it('[ie8] → filter:Alpha, значение × 100', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', '0.5', elWithStyle('ie8')), ['filter', 'Alpha(opacity=50)']);
            });
            it('[ie8] 1 → пустое filter', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', 1, elWithStyle('ie8')), ['filter', '']);
            });
            it('[ie8] строка "1" → тоже пустое (=="1" по loose-equality)', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', '1', elWithStyle('ie8')), ['filter', '']);
            });
            it('[ie10] opacity появился — без преобразований', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', '0.5', elWithStyle('ie10')), ['opacity', '0.5']);
            });
            it('без el: эталон — document (подмена на ie8)', function() {
                withStyle('ie8', function() {
                    assert.deepEqual(Bricks.DOM.normalizeCSSProperty('opacity', '0.5'), ['filter', 'Alpha(opacity=50)']);
                });
            });
        });

        describe('normalizeCSSProperty: float', function() {
            it('[modern] → cssFloat', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('float', 'left', elWithStyle('modern')), ['cssFloat', 'left']);
            });
            it('[ie8] → styleFloat', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('float', 'left', elWithStyle('ie8')), ['styleFloat', 'left']);
            });
            // Текущее поведение: без el float не нормализуется вообще при
            // любом эталоне (именованная ветка — только с el). Продуктовое
            // решение о скрытой document-зависимости — open (todo 20260921-7).
            it('без el → "float" (не нормализуется — зафиксировано)', function() {
                withStyle('ie8', function() {
                    assert.deepEqual(Bricks.DOM.normalizeCSSProperty('float', 'left'), ['float', 'left']);
                });
            });
        });

        describe('normalizeCSSProperty: display: flex', function() {
            it('[ie10] → -ms-flexbox', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('display', 'flex', elWithStyle('ie10')), ['display', '-ms-flexbox']);
            });
            it('[modern] без преобразований', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('display', 'flex', elWithStyle('modern')), ['display', 'flex']);
            });
            it('[ie8] без преобразований (-ms- ветки нет)', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('display', 'flex', elWithStyle('ie8')), ['display', 'flex']);
            });
            it('значение ≠ flex не трогает ([modern])', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('display', 'block', elWithStyle('modern')), ['display', 'block']);
            });
        });

        describe('normalizeCSSProperty: generic-префиксы (border-radius)', function() {
            var cases = [
                ['modern', ['borderRadius', '5px']],
                ['ie8', ['borderRadius', '5px']],
                ['ie10', ['-ms-borderRadius', '5px']],
                ['moz', ['MozBorderRadius', '5px']],
                ['webkit', ['WebkitBorderRadius', '5px']],
                ['o', ['OBorderRadius', '5px']]
            ];
            cases.forEach(function(c) {
                it('[' + c[0] + '] ' + c[1].join(' / '), function() {
                    assert.deepEqual(Bricks.DOM.normalizeCSSProperty('border-radius', '5px', elWithStyle(c[0])), c[1]);
                });
            });
            it('camel-имя (borderRadius) — тот же результат ([webkit])', function() {
                assert.deepEqual(Bricks.DOM.normalizeCSSProperty('borderRadius', '5px', elWithStyle('webkit')), ['WebkitBorderRadius', '5px']);
            });
            it('без el: эталон document (подмена на webkit)', function() {
                withStyle('webkit', function() {
                    assert.deepEqual(Bricks.DOM.normalizeCSSProperty('border-radius', '5px'), ['WebkitBorderRadius', '5px']);
                });
            });
        });
    });
})();
