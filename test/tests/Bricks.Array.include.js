(function() {
    //#require Bricks.Array.include
    describe('Bricks.Array.include', function() {
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
})();
