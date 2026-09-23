(function() {
    //#imports
    describe('Bricks.QueryString', function() {

        describe('parse', function() {
            it('пустая строка — пустой объект', function() {
                assert.deepEqual(Bricks.QueryString.parse(''), {});
            });
            it('один параметр', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=1'), {a: '1'});
            });
            it('несколько параметров', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=1&b=2'), {a: '1', b: '2'});
            });
            it('плюс декодируется в пробел', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=1+2'), {a: '1 2'});
            });
            it('процентное декодирование', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=%20b'), {a: ' b'});
                assert.deepEqual(Bricks.QueryString.parse('a%20b=1'), {'a b': '1'});
            });
            it('равно в значении — часть значения (батч 1: фикс slice(1).join("="))', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=b=c'), {a: 'b=c'});
            });
            it('закодированное равно в значении', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=a%3Dx'), {a: 'a=x'});
            });
            it('параметр без знака равно — пустое значение', function() {
                assert.deepEqual(Bricks.QueryString.parse('a'), {a: ''});
                assert.deepEqual(Bricks.QueryString.parse('a='), {a: ''});
            });
            it('пустой ключ пропускается', function() {
                assert.deepEqual(Bricks.QueryString.parse('=1'), {});
            });
            it('хвостовой & игнорируется', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=1&'), {a: '1'});
            });
            it('повторяющиеся параметры — массив', function() {
                assert.deepEqual(Bricks.QueryString.parse('a=1&a=2'), {a: ['1', '2']});
                assert.deepEqual(Bricks.QueryString.parse('a=1&a=2&a=3'), {a: ['1', '2', '3']});
            });
        });

        describe('stringify', function() {
            it('кодирует ключи и значения', function() {
                assert.equal(Bricks.QueryString.stringify({a: 1, b: 'x y'}), 'a=1&b=x%20y');
            });
            it('равно в значении кодируется', function() {
                assert.equal(Bricks.QueryString.stringify({a: 'b=c'}), 'a=b%3Dc');
            });
            it('массив — повторение параметра', function() {
                assert.equal(Bricks.QueryString.stringify({a: [1, 2]}), 'a=1&a=2');
            });
            it('пустой объект — пустая строка', function() {
                assert.equal(Bricks.QueryString.stringify({}), '');
            });
            it('прототипные свойства не включаются', function() {
                var obj = Object.create({fromProto: 1});
                obj.own = 2;
                assert.equal(Bricks.QueryString.stringify(obj), 'own=2');
            });
            it('roundtrip: stringify → parse возвращает исходное', function() {
                var original = {a: 'b=c', b: 'x y', c: 5};
                var roundtripped = Bricks.QueryString.parse(Bricks.QueryString.stringify(original));
                assert.deepEqual(roundtripped, original);
            });
        });
    });
})();