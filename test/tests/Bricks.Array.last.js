(function() {
    //#imports
    describe('Bricks.Array.last', function() {
        it('last element of array with 3 items', function() {
            assert.equal(Bricks.Array.last([1, 2, 3]), 3);
        });
        it('last element of empty array must be equal to undefined', function() {
            assert.equal(Bricks.Array.last([]), undefined);
        });
    });
})();
