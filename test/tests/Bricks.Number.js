(function() {
    //#imports
    describe('Bricks.Number', function() {
        //#if lang_ru
        describe('pluralIndex (lang_ru)', function() {
            it('1, 21, 101 — форма 0', function() {
                assert.equal(Bricks.Number.pluralIndex(1), 0);
                assert.equal(Bricks.Number.pluralIndex(21), 0);
                assert.equal(Bricks.Number.pluralIndex(101), 0);
            });
            it('2..4, 22 — форма 1', function() {
                assert.equal(Bricks.Number.pluralIndex(2), 1);
                assert.equal(Bricks.Number.pluralIndex(4), 1);
                assert.equal(Bricks.Number.pluralIndex(22), 1);
                assert.equal(Bricks.Number.pluralIndex(222), 1);
            });
            it('5, 0, 11..14, 112, 25, 100, 110, 111, 115 — форма 2 (teens всегда форма 2)', function() {
                assert.equal(Bricks.Number.pluralIndex(5), 2);
                assert.equal(Bricks.Number.pluralIndex(0), 2);
                assert.equal(Bricks.Number.pluralIndex(11), 2);
                assert.equal(Bricks.Number.pluralIndex(12), 2);
                assert.equal(Bricks.Number.pluralIndex(13), 2);
                assert.equal(Bricks.Number.pluralIndex(14), 2);
                assert.equal(Bricks.Number.pluralIndex(112), 2);
                assert.equal(Bricks.Number.pluralIndex(25), 2);
                assert.equal(Bricks.Number.pluralIndex(100), 2);
                assert.equal(Bricks.Number.pluralIndex(110), 2);
                assert.equal(Bricks.Number.pluralIndex(111), 2);
                assert.equal(Bricks.Number.pluralIndex(115), 2);
            });
            it('отрицательные числа — по модулю', function() {
                assert.equal(Bricks.Number.pluralIndex(-1), 0);
                assert.equal(Bricks.Number.pluralIndex(-11), 2);
                assert.equal(Bricks.Number.pluralIndex(-12), 2);
                assert.equal(Bricks.Number.pluralIndex(-101), 0);
            });
        });

        describe('plural (lang_ru)', function() {
            it('число + неразрывный пробел + форма', function() {
                assert.equal(Bricks.Number.plural(1, 'комментарий|комментария|комментариев'), '1\u00a0комментарий');
                assert.equal(Bricks.Number.plural(2, 'комментарий|комментария|комментариев'), '2\u00a0комментария');
                assert.equal(Bricks.Number.plural(5, 'комментарий|комментария|комментариев'), '5\u00a0комментариев');
            });
            it('hideNumber — без числа', function() {
                assert.equal(Bricks.Number.plural(5, 'комментарий|комментария|комментариев', true), 'комментариев');
            });
        });
        //#endif
        //#if lang_en
        describe('pluralIndex (lang_en)', function() {
            it('1 — форма 0', function() {
                assert.equal(Bricks.Number.pluralIndex(1), 0);
                assert.equal(Bricks.Number.pluralIndex(-1), 0);
            });
            it('остальные — форма 1', function() {
                assert.equal(Bricks.Number.pluralIndex(0), 1);
                assert.equal(Bricks.Number.pluralIndex(2), 1);
                assert.equal(Bricks.Number.pluralIndex(5), 1);
            });
        });

        describe('plural (lang_en)', function() {
            it('число + неразрывный пробел + форма', function() {
                assert.equal(Bricks.Number.plural(1, 'cat|cats'), '1\u00a0cat');
                assert.equal(Bricks.Number.plural(2, 'cat|cats'), '2\u00a0cats');
                assert.equal(Bricks.Number.plural(5, 'cat|cats'), '5\u00a0cats');
            });
            it('hideNumber — без числа', function() {
                assert.equal(Bricks.Number.plural(5, 'cat|cats', true), 'cats');
            });
        });
        //#endif

        describe('pad2', function() {
            it('< 10 — ведущий ноль', function() {
                assert.equal(Bricks.Number.pad2(0), '00');
                assert.equal(Bricks.Number.pad2(5), '05');
                assert.equal(Bricks.Number.pad2(9), '09');
            });
            it('>= 10 — без дополнения', function() {
                assert.equal(Bricks.Number.pad2(10), '10');
                assert.equal(Bricks.Number.pad2(59), '59');
                assert.equal(Bricks.Number.pad2(99), '99');
                assert.equal(Bricks.Number.pad2(100), '100');
            });
        });
    });
})();
