(function() {
    //#imports
    describe('Bricks.Rnd', function() {

        describe('детерминизм', function() {
            it('равный seed — равные последовательности', function() {
                var a = new Bricks.Rnd(42);
                var b = new Bricks.Rnd(42);
                for (var i = 0; i < 20; i++) {
                    assert.strictEqual(a.int32(), b.int32());
                }
            });
            it('разные seed — разные последовательности', function() {
                var a = new Bricks.Rnd(42);
                var b = new Bricks.Rnd(43);
                assert.notStrictEqual(a.int32(), b.int32());
            });
            it('initByArray: равный ключ — равные последовательности', function() {
                var a = new Bricks.Rnd(1);
                var b = new Bricks.Rnd(1);
                a.initByArray([1, 2, 3], 3);
                b.initByArray([1, 2, 3], 3);
                for (var i = 0; i < 20; i++) {
                    assert.strictEqual(a.int32(), b.int32());
                }
            });
            it('initByArray: разные ключи — разные последовательности', function() {
                var a = new Bricks.Rnd(1);
                var b = new Bricks.Rnd(1);
                a.initByArray([1, 2, 3], 3);
                b.initByArray([1, 2, 4], 3);
                assert.notStrictEqual(a.int32(), b.int32());
            });
        });

        describe('int32', function() {
            it('целое в диапазоне [0, 2^32)', function() {
                var rnd = new Bricks.Rnd(7);
                for (var i = 0; i < 1000; i++) {
                    var v = rnd.int32();
                    assert.ok(v >= 0 && v < 0x100000000);
                    assert.equal(v, Math.floor(v));
                }
            });
        });

        describe('real1 / real2 / real3', function() {
            it('диапазоны', function() {
                var rnd = new Bricks.Rnd(99);
                for (var i = 0; i < 1000; i++) {
                    var r1 = rnd.real1();
                    var r2 = rnd.real2();
                    var r3 = rnd.real3();
                    assert.ok(r1 >= 0 && r1 <= 1);
                    assert.ok(r2 >= 0 && r2 < 1);
                    assert.ok(r3 > 0 && r3 < 1);
                }
            });
            it('random() — то же, что real2()', function() {
                // random() и real2() оба выполняют один шаг int32() и нормализуют его,
                // поэтому два одинаковых rnd дают равные значения на этом шаге.
                var a = new Bricks.Rnd(99);
                var b = new Bricks.Rnd(99);
                assert.strictEqual(a.random(), b.real2());
            });
        });

        describe('bool', function() {
            it('likelihood 0 — всегда false', function() {
                var rnd = new Bricks.Rnd(1);
                for (var i = 0; i < 500; i++) {
                    assert.ok(rnd.bool(0) === false);
                }
            });
            it('likelihood 100 — всегда true', function() {
                var rnd = new Bricks.Rnd(1);
                for (var i = 0; i < 500; i++) {
                    assert.ok(rnd.bool(100) === true);
                }
            });
            it('likelihood 50 — встречаются оба исхода', function() {
                var seen = {};
                var rnd = new Bricks.Rnd(1);
                for (var k = 0; k < 1000; k++) {
                    seen[rnd.bool(50)] = true;
                }
                assert.ok(seen[true] && seen[false]);
            });
            it('вне [0, 100] — RangeError', function() {
                var rnd = new Bricks.Rnd(1);
                assert.throws(function() {
                    rnd.bool(-1);
                }, RangeError);
                assert.throws(function() {
                    rnd.bool(101);
                }, RangeError);
            });
        });

        describe('natural', function() {
            it('без аргументов — [0, MAX_INT)', function() {
                var rnd = new Bricks.Rnd(3);
                for (var i = 0; i < 100; i++) {
                    var v = rnd.natural();
                    // MAX_INT живёт в прототипе класса (Bricks.create), а не на конструкторе:
                    // статический доступ Bricks.Rnd.MAX_INT даёт undefined.
                    assert.ok(v >= 0 && v <= rnd.MAX_INT);
                    assert.equal(v, Math.floor(v));
                }
            });
            it('один аргумент — [0, max]', function() {
                var rnd = new Bricks.Rnd(3);
                var seen = {};
                for (var j = 0; j < 1000; j++) {
                    var v2 = rnd.natural(5);
                    assert.ok(v2 >= 0 && v2 <= 5);
                    seen[v2] = true;
                }
                assert.ok(seen[0] && seen[5]);
            });
            it('два аргумента — [min, max] включительно', function() {
                var rnd = new Bricks.Rnd(3);
                var seen = {};
                for (var k = 0; k < 1000; k++) {
                    var v3 = rnd.natural(2, 7);
                    assert.ok(v3 >= 2 && v3 <= 7);
                    seen[v3] = true;
                }
                assert.ok(seen[2] && seen[7]);
            });
            it('некорректные границы — RangeError', function() {
                var rnd = new Bricks.Rnd(3);
                assert.throws(function() {
                    rnd.natural(-1, 5);
                }, RangeError);
                assert.throws(function() {
                    rnd.natural(7, 2);
                }, RangeError);
            });
        });

        describe('integer', function() {
            it('два аргумента — в диапазоне включительно', function() {
                var rnd = new Bricks.Rnd(11);
                for (var i = 0; i < 1000; i++) {
                    var v = rnd.integer(-10, 10);
                    assert.ok(v >= -10 && v <= 10);
                    assert.equal(v, Math.floor(v));
                }
            });
            it('malformed-диапазон (0, 1) — только 0 и 1, оба встречаются', function() {
                var rnd = new Bricks.Rnd(11);
                var seen = {};
                for (var j = 0; j < 1000; j++) {
                    var v2 = rnd.integer(0, 1);
                    assert.ok(v2 === 0 || v2 === 1);
                    seen[v2] = true;
                }
                assert.ok(seen[0] && seen[1]);
            });
            it('min > max — RangeError', function() {
                var rnd = new Bricks.Rnd(11);
                assert.throws(function() {
                    rnd.integer(5, 2);
                }, RangeError);
            });
        });

        describe('shuffle / pick', function() {
            it('shuffle — перестановка того же массива', function() {
                var array = [];
                for (var i = 0; i < 15; i++) {
                    array.push(i * 3 + 1);
                }
                var key1 = array.join(',');
                var rnd = new Bricks.Rnd(21);
                var result = rnd.shuffle(array);
                assert.strictEqual(result, array);
                // Детерминированный seed не гарантирует другой порядок для любого
                // набора — проверяем инварианты перестановки: тот же мультимножество.
                array.sort(function(a, b) {
                    return a - b;
                });
                for (var j = 0; j < 15; j++) {
                    assert.equal(array[j], j * 3 + 1);
                }
            });
            it('pick(один) — элемент массива', function() {
                var rnd = new Bricks.Rnd(5);
                var array = [1, 2, 3, 4, 5];
                for (var i = 0; i < 100; i++) {
                    assert.ok(array.indexOf(rnd.pick(array)) !== -1);
                }
            });
            it('pick(n) — n различных элементов, исходный массив не мутируется', function() {
                var rnd = new Bricks.Rnd(5);
                var array = [1, 2, 3, 4, 5];
                var original = array.slice(0);
                var picked = rnd.pick(array, 3);
                assert.equal(picked.length, 3);
                var seen = {};
                for (var i = 0; i < picked.length; i++) {
                    assert.ok(original.indexOf(picked[i]) !== -1);
                    seen[picked[i]] = true;
                }
                assert.equal(Object.keys(seen).length, 3);
                assert.deepEqual(array, original);
            });
        });
    });
})();
