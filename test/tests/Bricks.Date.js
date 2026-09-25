(function() {
    //#imports
    describe('Bricks.Date', function() {
        // Все даты конструируются в локальном времени — вычисления читают те же
        // локальные компоненты, поэтому ожидаемые значения не зависят от TZ машины.
        // getTimezoneOffset() (спецификаторы O/Z) ожидается тем же способом, что и в lib.

        var pad = function(n) {
            return (n < 10 ? '0' : '') + n;
        };

        var expectedOffset = function(date, colon) {
            var off = date.getTimezoneOffset();
            return (off > 0 ? '-' : '+') + pad(Math.floor(Math.abs(off) / 60)) + (colon ? ':' : '') + pad(Math.abs(off) % 60);
        };

        describe('clone', function() {
            it('копия независима, время то же', function() {
                var d = new Date(2024, 4, 15, 10, 30, 45, 123);
                var c = Bricks.Date.clone(d);
                assert.notStrictEqual(c, d);
                assert.strictEqual(c.getTime(), d.getTime());
                c.setFullYear(2025);
                assert.equal(d.getFullYear(), 2024);
            });
        });

        describe('isLeapYear', function() {
            it('2024 — високосный, 2023 — нет', function() {
                assert.ok(Bricks.Date.isLeapYear(new Date(2024, 0, 1)));
                assert.ok(!Bricks.Date.isLeapYear(new Date(2023, 0, 1)));
            });
            it('столетние годы: 2000 — да, 1900 и 2100 — нет', function() {
                assert.ok(Bricks.Date.isLeapYear(new Date(2000, 0, 1)));
                assert.ok(!Bricks.Date.isLeapYear(new Date(1900, 0, 1)));
                assert.ok(!Bricks.Date.isLeapYear(new Date(2100, 0, 1)));
            });
        });

        describe('getDaysInMonth', function() {
            it('февраль: 29 в високосный, 28 в обычный', function() {
                assert.equal(Bricks.Date.getDaysInMonth(new Date(2024, 1, 15)), 29);
                assert.equal(Bricks.Date.getDaysInMonth(new Date(2023, 1, 15)), 28);
            });
            it('прочие месяцы', function() {
                assert.equal(Bricks.Date.getDaysInMonth(new Date(2023, 0, 1)), 31);
                assert.equal(Bricks.Date.getDaysInMonth(new Date(2023, 3, 1)), 30);
                assert.equal(Bricks.Date.getDaysInMonth(new Date(2023, 11, 1)), 31);
            });
        });

        describe('clearTime', function() {
            it('обнуляет время, возвращает ту же дату', function() {
                var d = new Date(2024, 4, 15, 10, 30, 45, 123);
                var result = Bricks.Date.clearTime(d);
                assert.strictEqual(result, d);
                assert.equal(d.getHours(), 0);
                assert.equal(d.getMinutes(), 0);
                assert.equal(d.getSeconds(), 0);
                assert.equal(d.getMilliseconds(), 0);
                // Дата не тронута
                assert.equal(d.getFullYear(), 2024);
                assert.equal(d.getMonth(), 4);
                assert.equal(d.getDate(), 15);
            });
        });

        describe('getDayOfYear', function() {
            it('начало года — 0 (нумерация с нуля)', function() {
                assert.equal(Bricks.Date.getDayOfYear(new Date(2024, 0, 1)), 0);
            });
            it('учитывает високосность', function() {
                assert.equal(Bricks.Date.getDayOfYear(new Date(2024, 2, 1)), 60);
                assert.equal(Bricks.Date.getDayOfYear(new Date(2023, 2, 1)), 59);
            });
            it('конец года', function() {
                assert.equal(Bricks.Date.getDayOfYear(new Date(2024, 11, 31)), 365);
                assert.equal(Bricks.Date.getDayOfYear(new Date(2023, 11, 31)), 364);
            });
        });

        describe('getGMTOffset', function() {
            var d = new Date(2024, 4, 15, 10, 30, 45);
            it('знак и формат HHMM через getTimezoneOffset()', function() {
                assert.equal(Bricks.Date.getGMTOffset(d), expectedOffset(d, false));
            });
            it('colon — двоеточие', function() {
                assert.equal(Bricks.Date.getGMTOffset(d, true), expectedOffset(d, true));
            });
        });

        describe('getWeekOfYear', function() {
            // ISO-8601: неделя с первым четвергом года = W1, понедельник — первый день.
            it('2021-01-01 (пт) — ещё неделя 53 2020 года', function() {
                assert.equal(Bricks.Date.getWeekOfYear(new Date(2021, 0, 1)), 53);
            });
            it('2021-01-03 (вс) — та же неделя, 53', function() {
                assert.equal(Bricks.Date.getWeekOfYear(new Date(2021, 0, 3)), 53);
            });
            it('2021-01-04 (пн) — W1', function() {
                assert.equal(Bricks.Date.getWeekOfYear(new Date(2021, 0, 4)), 1);
            });
            it('2020 — високосный ISO-год, 2020-12-31 (чт) — W53', function() {
                assert.equal(Bricks.Date.getWeekOfYear(new Date(2020, 11, 31)), 53);
            });
            it('2021-12-31 (пт) — W52', function() {
                assert.equal(Bricks.Date.getWeekOfYear(new Date(2021, 11, 31)), 52);
            });
        });

        describe('format', function() {
            var d = new Date(2024, 4, 15, 10, 30, 45);

            it('Y-m-d', function() {
                assert.equal(Bricks.Date.format(d, 'Y-m-d'), '2024-05-15');
            });
            it('не-спецификаторы выводятся как есть', function() {
                assert.equal(Bricks.Date.format(d, 'Y/m/d'), '2024/05/15');
                assert.equal(Bricks.Date.format(d, 'Y q m'), '2024 q 05');
            });
            it('дни месяца: j (без нуля) и d (с нулём)', function() {
                assert.equal(Bricks.Date.format(d, 'j'), '15');
                assert.equal(Bricks.Date.format(d, 'd'), '15');
                var first = new Date(2024, 4, 5);
                assert.equal(Bricks.Date.format(first, 'j'), '5');
                assert.equal(Bricks.Date.format(first, 'd'), '05');
            });
            it('месяцы: n, m, M, F', function() {
                assert.equal(Bricks.Date.format(d, 'n-m-M-F'), '5-05-May-May');
            });
            it('дни недели: w, D, l', function() {
                assert.equal(Bricks.Date.format(d, 'w-D-l'), '3-Wed-Wednesday');
            });
            it('время: H:i:s и G', function() {
                assert.equal(Bricks.Date.format(d, 'H:i:s G'), '10:30:45 10');
            });
            it('12-часовой формат: h, g, a, A', function() {
                assert.equal(Bricks.Date.format(d, 'h:G a A'), '10:10 am AM');
                var evening = new Date(2024, 4, 15, 15, 5);
                assert.equal(Bricks.Date.format(evening, 'h a A'), '03 pm PM');
            });
            it('L, t, z, W, y, U', function() {
                assert.equal(Bricks.Date.format(d, 'L'), '1');
                assert.equal(Bricks.Date.format(d, 't'), '31');
                assert.equal(Bricks.Date.format(d, 'z'), '135');
                assert.equal(Bricks.Date.format(d, 'W'), '20');
                assert.equal(Bricks.Date.format(d, 'y'), '24');
                assert.equal(Bricks.Date.format(d, 'U'), String(Math.floor(d.getTime() / 1000)));
            });
            it('S — суффикс дня', function() {
                assert.equal(Bricks.Date.format(new Date(2024, 0, 1), 'jS'), '1st');
                assert.equal(Bricks.Date.format(new Date(2024, 0, 2), 'jS'), '2nd');
                assert.equal(Bricks.Date.format(new Date(2024, 0, 3), 'jS'), '3rd');
                assert.equal(Bricks.Date.format(new Date(2024, 0, 11), 'jS'), '11th');
                assert.equal(Bricks.Date.format(new Date(2024, 0, 21), 'jS'), '21st');
            });
            it('O и Z — сдвиг через getTimezoneOffset()', function() {
                assert.equal(Bricks.Date.format(d, 'O'), expectedOffset(d, false));
                assert.equal(Bricks.Date.format(d, 'Z'), String(-60 * d.getTimezoneOffset()));
            });
            it('c — ISO 8601', function() {
                assert.equal(Bricks.Date.format(d, 'c'), '2024-05-15T10:30:45' + expectedOffset(d, true));
            });
            it('r — RFC 2822', function() {
                assert.equal(Bricks.Date.format(d, 'r'), 'Wed, 15 May 2024 10:30:45 ' + expectedOffset(d, false));
            });
            it('эскейп \\ перед спецификатором', function() {
                assert.equal(Bricks.Date.format(d, 'Y\\-m'), '2024-05');
            });
            it('двойной эскейп \\\\ — литеральный бэкслэш', function() {
                assert.equal(Bricks.Date.format(d, 'Y\\\\'), '2024\\');
            });
            it('одна строка формата, разные даты', function() {
                assert.equal(Bricks.Date.format(d, 'Y-m-d'), '2024-05-15');
                assert.equal(Bricks.Date.format(new Date(1999, 11, 31, 23, 59, 59), 'Y-m-d'), '1999-12-31');
            });
            it('line-терминаторы в строке формата сохраняются', function() {
                assert.equal(Bricks.Date.format(d, 'Y\nm'), '2024\n05');
                assert.equal(Bricks.Date.frmt(d, 'Y\nm'), '2024\n05');
            });
        });

        describe('frmt', function() {
            var d = new Date(2024, 4, 15, 10, 30, 45);

            it('Y-m-d H:i:s', function() {
                assert.equal(Bricks.Date.frmt(d, 'Y-m-d H:i:s'), '2024-05-15 10:30:45');
            });
            it('совпадает с format для общих спецификаторов', function() {
                assert.equal(Bricks.Date.frmt(d, 'Y-m-d H:i:s'), Bricks.Date.format(d, 'Y-m-d H:i:s'));
            });
            it('ведущие нули', function() {
                var single = new Date(2024, 0, 5, 1, 2, 3);
                assert.equal(Bricks.Date.frmt(single, 'Y-m-d H:i:s'), '2024-01-05 01:02:03');
            });
            it('не-спецификаторы выводятся как есть', function() {
                assert.equal(Bricks.Date.frmt(d, 'Y/m/d'), '2024/05/15');
                assert.equal(Bricks.Date.frmt(d, 'Y q m'), '2024 q 05');
            });
            it('остальные спецификаторы format не распознаются', function() {
                assert.equal(Bricks.Date.frmt(d, 'F D j G'), 'F D j G');
                assert.equal(Bricks.Date.format(d, 'F D j G'), 'May Wed 15 10');
            });
        });
    });
})();
