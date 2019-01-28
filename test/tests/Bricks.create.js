(function() {
    //#imports
    describe('Bricks.create', function() {
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
})();
