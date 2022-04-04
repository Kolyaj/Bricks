(function() {
    //#imports
    describe('Bricks.Array.flatten', function() {
        it('flatten with infinite depth', function() {
            assert.deepEqual(Bricks.Array.flatten([1, [2, [3, 4], 5, [6, 7], 8], 9]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        it('flatten with depth=1', function() {
            assert.deepEqual(Bricks.Array.flatten([1, [2, [3, 4], 5, [6, 7], 8], 9], 1), [1, 2, [3, 4], 5, [6, 7], 8, 9]);
        });
    });
})();
