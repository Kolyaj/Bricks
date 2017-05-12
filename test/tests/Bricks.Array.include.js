(function() {
    //#require Bricks.Array.include
    describe('Bricks.Array.include', function() {
        it('search one element in array', function() {
            chai.assert.isOk(Bricks.Array.include([1, 2, 3], 2));
        });
        it('search nothing', function() {
            chai.assert.isNotOk(Bricks.Array.include([1, 2, 3], 4));
        });
        it('search many items', function() {
            chai.assert.isOk(Bricks.Array.include([1, 2, 3], 1, 2, 3));
        });
        it('not search any item', function() {
            chai.assert.isNotOk(Bricks.Array.include([1, 2, 3], 3, 4));
        });
    });
})();
