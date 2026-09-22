(function() {
    //#imports
    describe('Bricks.rand', function() {
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
})();
