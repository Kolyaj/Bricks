(function() {
    //#require Bricks.Cookie.createCookie
    //#require Bricks.Cookie.readCookie
    //#require Bricks.Cookie.eraseCookie

    describe('Bricks.Cookie', function() {
        it('Create session cookie', function() {
            Bricks.Cookie.createCookie('foo', 'bar');
            assert.equal(Bricks.Cookie.readCookie('foo'), 'bar');
        });

        it('Erase cookie', function() {
            Bricks.Cookie.createCookie('foo', 'bar');
            Bricks.Cookie.eraseCookie('foo');
            assert.equal(Bricks.Cookie.readCookie('foo'), null);
        });

        it('Create ttl cookie', function(callback) {
            Bricks.Cookie.createCookie('foo', 'bar', 1 / 86400); // Ставим куку на одну секунду
            assert.equal(Bricks.Cookie.readCookie('foo'), 'bar');
            setTimeout(function() {
                assert.equal(Bricks.Cookie.readCookie('foo'), null);
                callback();
            }, 1000)
        });

        // Просто создаём две куки, на текущий домен и на все поддомены
        Bricks.Cookie.createCookie('foo1', 'bar1');
        Bricks.Cookie.createCookie('foo2', 'bar2', null, '.bricks.tests');
    });
})();
