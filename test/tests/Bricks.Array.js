(function() {
    //#imports
    describe('Bricks.Array', function() {

        describe('last', function() {
            it('возвращает последний элемент', function() {
                assert.equal(Bricks.Array.last([1, 2, 3]), 3);
                assert.equal(Bricks.Array.last([1]), 1);
            });
            it('пустой массив — undefined', function() {
                assert.equal(Bricks.Array.last([]), undefined);
            });
        });

        describe('isArray', function() {
            it('основные случаи', function() {
                assert.ok(Bricks.Array.isArray([]));
                assert.ok(Bricks.Array.isArray([1, 2]));
                assert.ok(!Bricks.Array.isArray({}));
                assert.ok(!Bricks.Array.isArray('str'));
            });
        });

        describe('flatten', function() {
            it('flatten with infinite depth', function() {
                assert.deepEqual(Bricks.Array.flatten([1, [2, [3, 4], 5, [6, 7], 8], 9]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
            });
            it('flatten with depth=1', function() {
                assert.deepEqual(Bricks.Array.flatten([1, [2, [3, 4], 5, [6, 7], 8], 9], 1), [1, 2, [3, 4], 5, [6, 7], 8, 9]);
            });
            it('flatten with depth=2', function() {
                assert.deepEqual(Bricks.Array.flatten([1, [2, [3, 4], 5, [6, [7, 8]], 9]], 2), [1, 2, 3, 4, 5, 6, [7, 8], 9]);
            });
            it('flatten with depth=0 — массив не разворачивается', function() {
                assert.deepEqual(Bricks.Array.flatten([1, [2, 3]], 0), [1, [2, 3]]);
            });
            it('результат накапливается в переданный output-массив', function() {
                var output = [0];
                var result = Bricks.Array.flatten([1, [2]], 1, output);
                assert.strictEqual(result, output);
                assert.deepEqual(output, [0, 1, 2]);
            });
        });

        describe('include', function() {
            it('search one element in array', function() {
                assert.ok(Bricks.Array.include([1, 2, 3], 2));
            });
            it('search nothing', function() {
                assert.ok(!Bricks.Array.include([1, 2, 3], 4));
            });
            it('search many items', function() {
                assert.ok(Bricks.Array.include([1, 2, 3], 1, 2, 3));
            });
            it('not search any item', function() {
                assert.ok(!Bricks.Array.include([1, 2, 3], 3, 4));
            });
        });

        describe('shuffle', function() {
            it('перестановка: те же элементы, другой порядок', function() {
                // 15 элементов: вероятность идентичной перестановки 1/15! ≈ 6e-13 —
                // флейка исключена (на 5 элементах она была 1/120 за прогон).
                var array = [];
                for (var i = 0; i < 15; i++) {
                    array.push(i * 7 + 1);
                }
                var key1 = array.join(',');
                var result = Bricks.Array.shuffle(array);
                var key2 = array.join(',');
                assert.strictEqual(result, array);
                assert.notEqual(key1, key2);
                array.sort(function(a, b) {
                    return a - b;
                });
                for (var j = 0; j < 15; j++) {
                    assert.equal(array[j], j * 7 + 1);
                }
            });
        });

        describe('pick', function() {
            it('pick element', function() {
                assert.equal(Bricks.Array.pick([2, 2, 2, 2, 2]), 2);
            });
            it('pick many times', function() {
                for (var i = 0; i < 100; i++) {
                    assert.equal(Bricks.Array.pick([2]), 2);
                }
            });
            it('всегда возвращает элемент массива', function() {
                var array = [1, 2, 3, 4, 5];
                for (var k = 0; k < 100; k++) {
                    assert.ok(array.indexOf(Bricks.Array.pick(array)) !== -1);
                }
            });
        });
    });
})();
