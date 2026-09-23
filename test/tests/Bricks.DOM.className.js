(function() {
    //#imports
    describe('Bricks.DOM class* (браузерные профили элемента)', function() {
        // Три формы host-элемента (Profiles.el): modern — с classList,
        // legacy — без classList (IE9 и старше), svg — className не строка,
        // значение живёт в атрибуте class. Класс — вход нормализации, mock-уется.
        var profiles = BricksTest.Profiles.el;

        var profileNames = Object.keys(profiles);

        // Токены текущего className элемента в нормализованном виде.
        var tokens = function(el) {
            var raw = Bricks.DOM.getClassName(el) || '';
            var result = raw.split(/\s+/);
            if (result[0] === '') {
                result.shift();
            }
            return result;
        };

        var hasToken = function(el, name) {
            return tokens(el).indexOf(name) !== -1;
        };

        var forAllProfiles = function(name, test) {
            for (var i = 0; i < profileNames.length; i++) {
                var profileName = profileNames[i];
                it('[' + profileName + '] ' + name, function() {
                    test(profiles[profileName]);
                });
            }
        };

        forAllProfiles('getEl: объект-элемент проходит как есть (identity)', function(makeEl) {
            var el = makeEl('a');
            assert.strictEqual(Bricks.DOM.getEl(el), el);
        });

        forAllProfiles('classNameExists: найдены все токены', function(makeEl) {
            var el = makeEl('foo bar');
            assert.ok(Bricks.DOM.classNameExists(el, 'foo'));
            assert.ok(Bricks.DOM.classNameExists(el, 'bar'));
        });

        forAllProfiles('classNameExists: отсутствие класса', function(makeEl) {
            var el = makeEl('foo bar');
            assert.ok(!Bricks.DOM.classNameExists(el, 'baz'));
        });

        forAllProfiles('classNameExists: граница слова — "foobar" не содержит "foo"', function(makeEl) {
            var el = makeEl('foobar');
            assert.ok(!Bricks.DOM.classNameExists(el, 'foo'));
        });

        forAllProfiles('classNameExists: пустой класс', function(makeEl) {
            var el = makeEl('');
            assert.ok(!Bricks.DOM.classNameExists(el, 'foo'));
        });

        forAllProfiles('classNameExists: пробелы вокруг имени класса не мешают', function(makeEl) {
            var el = makeEl('foo bar');
            assert.ok(Bricks.DOM.classNameExists(el, '  foo  '));
        });

        forAllProfiles('addClassName: добавляет класс', function(makeEl) {
            var el = makeEl('foo');
            Bricks.DOM.addClassName(el, 'bar');
            assert.ok(hasToken(el, 'foo'));
            assert.ok(hasToken(el, 'bar'));
            assert.equal(tokens(el).length, 2);
        });

        forAllProfiles('addClassName: повторное добавление не дублирует', function(makeEl) {
            var el = makeEl('foo');
            Bricks.DOM.addClassName(el, 'foo');
            var elTokens = tokens(el);
            assert.equal(elTokens.length, 1);
            assert.equal(elTokens[0], 'foo');
        });

        forAllProfiles('addClassName: к пустому классу', function(makeEl) {
            var el = makeEl('');
            Bricks.DOM.addClassName(el, 'foo');
            assert.ok(hasToken(el, 'foo'));
            assert.equal(tokens(el).length, 1);
        });

        forAllProfiles('removeClassName: удаляет класс', function(makeEl) {
            var el = makeEl('a b c');
            Bricks.DOM.removeClassName(el, 'b');
            var elTokens = tokens(el);
            assert.deepEqual(elTokens, ['a', 'c']);
        });

        forAllProfiles('removeClassName: отсутствующего класса нет — классы не меняются', function(makeEl) {
            var el = makeEl('a b');
            Bricks.DOM.removeClassName(el, 'z');
            assert.ok(hasToken(el, 'a'));
            assert.ok(hasToken(el, 'b'));
            assert.equal(tokens(el).length, 2);
        });

        forAllProfiles('toggleClassName: переключение наличия, возвращает факт переключения (батч 1: фикс return)', function(makeEl) {
            var el = makeEl('a');
            assert.strictEqual(Bricks.DOM.toggleClassName(el, 'b'), true);
            assert.ok(hasToken(el, 'b'));
            assert.strictEqual(Bricks.DOM.toggleClassName(el, 'b'), true);
            assert.ok(!hasToken(el, 'b'));
            // Явный adding, совпадающий с текущим состоянием — не переключение.
            assert.strictEqual(Bricks.DOM.toggleClassName(el, 'b', false), false);
            assert.ok(!hasToken(el, 'b'));
        });

        // Точное строковое представление: реализации различаются
        // (legacy-ветка может оставлять лишние пробелы), поэтому — по профильно.
        it('[legacy] removeClassName: точный результат с лишним пробелом', function() {
            var el = profiles.legacy('a b c');
            Bricks.DOM.removeClassName(el, 'b');
            assert.equal(el.className, 'a  c');
        });

        it('[modern] removeClassName: нормализованный результат', function() {
            var el = profiles.modern('a b c');
            Bricks.DOM.removeClassName(el, 'b');
            assert.equal(el.className, 'a c');
        });

        it('[svg] класс живёт в атрибуте class, свойство className не используется', function() {
            var el = profiles.svg('a b');
            // У XML-элементов className — не строка: все операции идут через атрибут.
            assert.equal(typeof el.className, 'object');
            Bricks.DOM.removeClassName(el, 'b');
            assert.ok(hasToken(el, 'a'));
            assert.ok(!hasToken(el, 'b'));
            Bricks.DOM.addClassName(el, 'c');
            assert.ok(hasToken(el, 'a'));
            assert.ok(hasToken(el, 'c'));
            // Свойство className при этом не мутируется.
            assert.deepEqual(el.className, {});
        });
    });
})();