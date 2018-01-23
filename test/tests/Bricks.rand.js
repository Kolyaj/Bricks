(function() {
    //#require Bricks.rand
    describe('Bricks.rand', function() {
        it('distribution must be uniform', function() {
            var res = [0, 0, 0, 0];
            for (var i = 0; i < 10000; i++) {
                res[Bricks.rand(res.length - 1)]++;
            }
            chai.assert.isOk(Math.max.apply(Math, res) - Math.min.apply(Math, res) < 200);
        });
        it('distribution bounds', function() {
            var res = [0, 0, 0, 0];
            for (var i = 0; i < 10000; i++) {
                res[Bricks.rand(1, 2)]++;
            }
            chai.assert.equal(res[0], 0);
            chai.assert.isOk(res[1] > 0);
            chai.assert.isOk(res[2] > 0);
            chai.assert.equal(res[3], 0);
        });
    });
})();
