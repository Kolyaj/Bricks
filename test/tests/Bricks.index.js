(function() {
    //#imports
    describe('Bricks.index', function() {

        describe('mixin', function() {
            it('копирует own-свойства всех аргументов, начиная со второго; более поздние перепишут ранние', function() {
                var dst = {};
                Bricks.mixin(dst, {a: 1, c: 1}, {b: 2, a: 5});
                assert.deepEqual(dst, {a: 5, b: 2, c: 1});
            });

            it('возвращает тот же объект dst', function() {
                var dst = {x: 1};
                assert.strictEqual(Bricks.mixin(dst, {y: 2}), dst);
            });

            it('falsy-аргументы (null, undefined, 0, "") пропускаются', function() {
                var dst = {x: 1};
                Bricks.mixin(dst, null, undefined, 0, '');
                assert.deepEqual(dst, {x: 1});
            });

            it('прототипные свойства источника не копируются', function() {
                var src = Object.create({hidden: 1});
                src.own = 2;
                var dst = {};
                Bricks.mixin(dst, src);
                assert.equal(dst.own, 2);
                assert.equal('hidden' in dst, false);
            });

            it('own toString копируется', function() {
                var dst = {};
                Bricks.mixin(dst, {toString: function() {
                    return 'custom';
                }});
                assert.equal(dst.toString(), 'custom');
            });
        });

        describe('create', function() {
            it('Если передан constructor, то его и вернёт функция', function() {
                var ctor = function() {};
                var A = Bricks.create({
                    constructor: ctor
                });
                assert.equal(A, ctor);
            });
            it('Свойства из переданного объекта попадают в прототип', function() {
                var A = Bricks.create({
                    a: 5
                });
                assert.equal(A.prototype.a, 5);
            });
            it('instanceof', function() {
                var A = Bricks.create();
                var a = new A();
                assert.ok(a instanceof A)
            });
            it('instanceof с родительским классом', function() {
                var A = Bricks.create();
                var B = A.inherit();
                var b = new B();
                assert.ok(b instanceof A);
            });
            it('Свойства из родительского прототипа читаются в дочернем', function() {
                var A = Bricks.create({
                    a: 5
                });
                var B = A.inherit();
                var b = new B();
                assert.equal(b.a, 5);
            });
            it('Свойство superclass у конструктора указывает на прототип родительского конструктора', function() {
                var A = Bricks.create();
                var B = A.inherit();
                assert.equal(B.superclass, A.prototype);
            });
        });

        describe('inherit', function() {
            it('Если передан constructor, то его и вернёт функция', function() {
                var ctor = function() {};
                var A = Bricks.inherit({
                    constructor: ctor
                });
                assert.equal(A, ctor);
            });
            it('Свойства из переданного объекта попадают в прототип', function() {
                var A = Bricks.inherit({
                    a: 5
                });
                assert.equal(A.prototype.a, 5);
            });
            it('instanceof', function() {
                var A = Bricks.inherit();
                var a = new A();
                assert.ok(a instanceof A)
            });
            it('instanceof с родительским классом', function() {
                var A = Bricks.inherit();
                var B = Bricks.inherit(A);
                var b = new B();
                assert.ok(b instanceof A);
            });
            it('Свойства из родительского прототипа читаются в дочернем', function() {
                var A = Bricks.inherit({
                    a: 5
                });
                var B = Bricks.inherit(A);
                var b = new B();
                assert.equal(b.a, 5);
            });
            it('Свойство superclass у конструктора указывает на прототип родительского конструктора', function() {
                var A = Bricks.inherit();
                var B = Bricks.inherit(A);
                assert.equal(B.superclass, A.prototype);
            });
            it('В инстансе от наследуемого класса свойства будут из всей цепочки', function() {
                var A = Bricks.inherit({
                    a: 1
                });
                var B = Bricks.inherit(A, {
                    b: 2
                });
                var b = new B();
                assert.equal(b.a, 1);
                assert.equal(b.b, 2);
            });
        });

        describe('getPrototypeChain', function() {
            it('цепочка от инстанса до Object.prototype (завершается корнем)', function() {
                var A = Bricks.create({a: 1});
                var B = A.inherit({b: 2});
                var b = new B();
                var chain = Bricks.getPrototypeChain(b);
                assert.equal(chain.length, 4);
                assert.strictEqual(chain[0], b);
                assert.strictEqual(chain[1], B.prototype);
                assert.strictEqual(chain[2], A.prototype);
                assert.strictEqual(chain[3], Object.prototype);
            });

            it('фильтр по prop: только объекты цепочки, содержащие это свойство', function() {
                var A = Bricks.create({a: 1});
                var B = A.inherit({a: 2, b: 3});
                var b = new B();
                var chain = Bricks.getPrototypeChain(b, 'a');
                assert.equal(chain.length, 2);
                assert.strictEqual(chain[0], B.prototype);
                assert.strictEqual(chain[1], A.prototype);
            });

            it('свойство инстанса попадает в начало цепочки', function() {
                var A = Bricks.create({a: 1});
                var B = A.inherit({a: 2});
                var b = new B();
                b.a = 3;
                var chain = Bricks.getPrototypeChain(b, 'a');
                assert.equal(chain.length, 3);
                assert.strictEqual(chain[0], b);
            });

            it('getPrototypeChainValues: значения prop по всей цепочке', function() {
                var A = Bricks.create({x: 1});
                var B = A.inherit({x: 2});
                var b = new B();
                b.x = 3;
                assert.deepEqual(Bricks.getPrototypeChainValues(b, 'x'), [3, 2, 1]);
            });

            it('getPrototypeChainValues: отсутствующий prop — пустой массив', function() {
                var A = Bricks.create({x: 1});
                var b = new A();
                assert.deepEqual(Bricks.getPrototypeChainValues(b, 'y'), []);
            });
        });

        describe('range', function() {
            it('два аргумента: start и count', function() {
                assert.deepEqual(Bricks.range(1, 3), [1, 2, 3]);
            });
            it('один аргумент: количество элементов от нуля', function() {
                assert.deepEqual(Bricks.range(2), [0, 1]);
            });
            it('count = 0 — пустой массив', function() {
                assert.deepEqual(Bricks.range(0), []);
                assert.deepEqual(Bricks.range(5, 0), []);
            });
            it('отрицательный start', function() {
                assert.deepEqual(Bricks.range(-2, 2), [-2, -1]);
            });
        });

        describe('rand', function() {
            it('distribution must be uniform', function() {
                var res = [0, 0, 0, 0];
                for (var i = 0; i < 10000; i++) {
                    res[Bricks.rand(res.length - 1)]++;
                }
                // Равномерный rand даёт разброс max−min ≈ 100 (3000 прогонов: максимум 330);
                // порог 400 исключает ложные срабатывания, но ловит смещение порядка 5%+.
                assert.ok(Math.max.apply(Math, res) - Math.min.apply(Math, res) < 400);
            });
            it('distribution bounds', function() {
                var res = [0, 0, 0, 0];
                for (var i = 0; i < 10000; i++) {
                    res[Bricks.rand(1, 2)]++;
                }
                assert.equal(res[0], 0);
                assert.ok(res[1] > 0);
                assert.ok(res[2] > 0);
                assert.equal(res[3], 0);
            });
        });

        describe('isArray (deprecated-алиас Bricks.Array.isArray)', function() {
            it('алиас указывает на ту же функцию', function() {
                assert.strictEqual(Bricks.isArray, Bricks.Array.isArray);
            });
            it('основные случаи', function() {
                assert.ok(Bricks.isArray([]));
                assert.ok(!Bricks.isArray({}));
                assert.ok(!Bricks.isArray('str'));
                assert.ok(!Bricks.isArray(null));
            });
        });
    });
})();
