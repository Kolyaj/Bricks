(function() {
    //#imports
    describe('Bricks.Cookie', function() {
        // document.cookie — хранилище (механизм, не вход, ADR 0003):
        // тесты работают только в реальном браузере (Yaxy).
        // beforeEach очищает хранилище — тесты независимы от состояния страницы.
        var clearAll = function() {
            var cookies = document.cookie ? document.cookie.split(';') : [];
            for (var i = 0; i < cookies.length; i++) {
                var name = cookies[i].split('=')[0].replace(/^\s+/, '');
                if (name) {
                    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                }
            }
        };

        beforeEach(clearAll);

        it('createCookie + readCookie', function() {
            Bricks.Cookie.createCookie('bricksTest', 'value');
            assert.equal(Bricks.Cookie.readCookie('bricksTest'), 'value');
        });

        it('readCookie отсутствующей куки — null', function() {
            assert.equal(Bricks.Cookie.readCookie('bricksTestAbsent'), null);
        });

        it('кука в середине хранилища', function() {
            Bricks.Cookie.createCookie('bricksTestA', '1');
            Bricks.Cookie.createCookie('bricksTestMid', '2');
            Bricks.Cookie.createCookie('bricksTestZ', '3');
            assert.equal(Bricks.Cookie.readCookie('bricksTestMid'), '2');
        });

        it('имя — префикс другого имени: возвращается точное', function() {
            Bricks.Cookie.createCookie('bricksTest', 'full');
            Bricks.Cookie.createCookie('bricks', 'prefix');
            assert.equal(Bricks.Cookie.readCookie('bricks'), 'prefix');
            assert.equal(Bricks.Cookie.readCookie('bricksTest'), 'full');
        });

        it('eraseCookie', function() {
            Bricks.Cookie.createCookie('bricksTestGone', 'value');
            Bricks.Cookie.eraseCookie('bricksTestGone');
            assert.equal(Bricks.Cookie.readCookie('bricksTestGone'), null);
        });

        it('кука с ttl истекает', function(callback) {
            Bricks.Cookie.createCookie('bricksTestTtl', 'value', 1 / 86400); // 1 секунда
            assert.equal(Bricks.Cookie.readCookie('bricksTestTtl'), 'value');
            setTimeout(function() {
                assert.equal(Bricks.Cookie.readCookie('bricksTestTtl'), null);
                callback();
            }, 1200);
        });

        it('кука родительского домена видна в поддомене', function() {
            var hostname = location.hostname;
            if (/^[0-9.:]+$/.test(hostname)) {
                return; // Числовой хост: куку с Domain браузер не поставит — проверка неприменима
            }
            var domain = '.' + hostname;
            var name = 'bricksTestDomain';
            Bricks.Cookie.createCookie(name, 'sub', null, domain);
            assert.equal(Bricks.Cookie.readCookie(name), 'sub');
            // Чистим явно с domain: без него delete не зацепит cookie родительского домена
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + domain;
        });
    });
})();
