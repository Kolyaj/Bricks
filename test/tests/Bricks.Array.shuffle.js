(function() {
    //#require Bricks.Array.shuffle
    describe('Bricks.Array.shuffle', function() {
        it('shuffle array', function() {
            var array = [1, 2, 3, 4, 5];
            var key1 = array.join(',');
            Bricks.Array.shuffle(array);
            var key2 = array.join(',');
            array.sort();
            assert.notEqual(key1, key2);
            assert.deepEqual(array, [1, 2, 3, 4, 5]);
        });
    });
})();
