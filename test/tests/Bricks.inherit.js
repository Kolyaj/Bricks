(function() {
    //#imports
    describe('Bricks.inherit', function() {
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
})();
