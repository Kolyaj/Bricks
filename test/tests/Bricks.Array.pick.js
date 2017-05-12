(function() {
    //#require Bricks.Array.pick
    describe('Bricks.Array.pick', function() {
        it('pick element', function() {
            chai.assert.equal(Bricks.Array.pick([2, 2, 2, 2, 2]), 2);
        });
        it('pick many times', function() {
            for (var i = 0; i < 100; i++) {
                chai.assert.equal(Bricks.Array.pick([2]), 2);
            }
        });
    });
})();
