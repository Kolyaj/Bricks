(function() {
    //#require Bricks2.mixin

    describe('Bricks2.mixin', function() {
        it('throw when target is not an object', function() {
            assert.throws(function() { Bricks2.mixin(null); }, TypeError);
            assert.throws(function() { Bricks2.mixin(undefined); }, TypeError);
        });
        it('mixin own enumerable properties from source to target object', function() {
            assert.deepEqual(Bricks2.mixin({foo: 0}, {bar: 1}), {
                foo: 0,
                bar: 1
            });
            assert.deepEqual(Bricks2.mixin({foo: 0}, null, undefined), {foo: 0});
            assert.deepEqual(Bricks2.mixin({foo: 0}, null, undefined, {bar: 1}, null), {
                foo: 0,
                bar: 1
            });
        });
        it('throw on null/undefined target', function() {
            assert.throws(function() { Bricks2.mixin(null, {}); });
            assert.throws(function() { Bricks2.mixin(undefined, {}); });
            assert.throws(function() { Bricks2.mixin(undefined, undefined); });
        });
        it('not throw on null/undefined sources', function() {
            assert.doesNotThrow(function() { Bricks2.mixin({}, null); });
            assert.doesNotThrow(function() { Bricks2.mixin({}, undefined); });
            assert.doesNotThrow(function() { Bricks2.mixin({}, undefined, null); });
        });
        it('support multiple sources', function() {
            assert.deepEqual(Bricks2.mixin({foo: 0}, {bar: 1}, {bar: 2}), {
                foo: 0,
                bar: 2
            });
            assert.deepEqual(Bricks2.mixin({}, {}, {foo: 1}), {foo: 1});
        });
        it('only iterate own keys', function() {
            var Unicorn = function () {};
            Unicorn.prototype.rainbows = 'many';
            var unicorn = new Unicorn();
            unicorn.bar = 1;

            assert.deepEqual(Bricks2.mixin({foo: 1}, unicorn), {
                foo: 1,
                bar: 1
            });
        });
        it('return the modified target object', function() {
            var target = {};
            var returned = Bricks2.mixin(target, {a: 1});
            assert.equal(returned, target);
        });
        it('accept primitives as target', function() {
            var target = Bricks2.mixin('abcdefg', {foo: 'bar'});
            var strObj = Object('abcdefg');
            strObj.foo = 'bar';
            assert.deepEqual(target, strObj);
        });
        it('doesn\'t mixin undefined properties', function() {
            assert.deepEqual(Bricks2.mixin({a: 5, b: 6}, {a: undefined, b: 7}), {a: 5, b: 7});
        });
    });
})();
