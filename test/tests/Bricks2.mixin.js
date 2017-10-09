(function() {
    //#require Bricks2.mixin

    describe('Bricks2.mixin', function() {
        it('throw when target is not an object', function() {
            chai.assert.throws(function() { Bricks2.mixin(null); }, TypeError);
            chai.assert.throws(function() { Bricks2.mixin(undefined); }, TypeError);
        });
        it('mixin own enumerable properties from source to target object', function() {
            chai.assert.deepEqual(Bricks2.mixin({foo: 0}, {bar: 1}), {
                foo: 0,
                bar: 1
            });
            chai.assert.deepEqual(Bricks2.mixin({foo: 0}, null, undefined), {foo: 0});
            chai.assert.deepEqual(Bricks2.mixin({foo: 0}, null, undefined, {bar: 1}, null), {
                foo: 0,
                bar: 1
            });
        });
        it('throw on null/undefined target', function() {
            chai.assert.throws(function() { Bricks2.mixin(null, {}); });
            chai.assert.throws(function() { Bricks2.mixin(undefined, {}); });
            chai.assert.throws(function() { Bricks2.mixin(undefined, undefined); });
        });
        it('not throw on null/undefined sources', function() {
            chai.assert.doesNotThrow(function() { Bricks2.mixin({}, null); });
            chai.assert.doesNotThrow(function() { Bricks2.mixin({}, undefined); });
            chai.assert.doesNotThrow(function() { Bricks2.mixin({}, undefined, null); });
        });
        it('support multiple sources', function() {
            chai.assert.deepEqual(Bricks2.mixin({foo: 0}, {bar: 1}, {bar: 2}), {
                foo: 0,
                bar: 2
            });
            chai.assert.deepEqual(Bricks2.mixin({}, {}, {foo: 1}), {foo: 1});
        });
        it('only iterate own keys', function() {
            var Unicorn = function () {};
            Unicorn.prototype.rainbows = 'many';
            var unicorn = new Unicorn();
            unicorn.bar = 1;

            chai.assert.deepEqual(Bricks2.mixin({foo: 1}, unicorn), {
                foo: 1,
                bar: 1
            });
        });
        it('return the modified target object', function() {
            var target = {};
            var returned = Bricks2.mixin(target, {a: 1});
            chai.assert.equal(returned, target);
        });
        it('accept primitives as target', function() {
            var target = Bricks2.mixin('abcdefg', {foo: 'bar'});
            var strObj = Object('abcdefg');
            strObj.foo = 'bar';
            chai.assert.deepEqual(target, strObj);
        });
        it('doesn\'t mixin undefined properties', function() {
            chai.assert.deepEqual(Bricks2.mixin({a: 5, b: 6}, {a: undefined, b: 7}), {a: 5, b: 7});
        });
    });
})();
