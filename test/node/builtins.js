// Node-встроенные сущности тестового харнесса (ADR 0003).
//
// createClock() — детерминированные fake-часы: в сьюите нет реального
// времени, тест продвигает время вручную (clock.tick(ms)), sinon в Node не нужен.
// Bricks.Function.* ходит и в window.setTimeout (defer),
// и в голой setTimeout (debounce/throttle) — обе точки ведут на одни часы.
//
// createBrowserGlobals(clock) — инертные заглушки браузерных глобалов:
// «современный браузер без фич», достаточно для загрузки кода и современных
// веток feature-проверок. Настоящие интерфейсы браузеров задают профили
// (test/profile, батч 2), которые подменяют заглушки по одному профилю.

var createClock = function() {
    var active = Object.create(null);
    var nextId = 0;

    var clock = {
        // Текущее (фейковое) время в миллисекундах.
        now: 0,

        setTimeout: function(fn, delay) {
            var id = ++nextId;
            active[id] = {fn: fn, time: clock.now + (delay == null ? 0 : delay)};
            return id;
        },

        clearTimeout: function(id) {
            delete active[id];
        },

        // Продвигает время на ms, запуская по пути все callbacks, пришедшие
        // в срок (включая запланированные уже запущенными).
        tick: function(ms) {
            var target = clock.now + ms;
            for (;;) {
                var due = null;
                var dueId = null;
                for (var id in active) {
                    var item = active[id];
                    if (item.time <= target && (due === null || item.time < due.time)) {
                        due = item;
                        dueId = id;
                    }
                }
                if (due === null) {
                    break;
                }
                clock.now = due.time;
                delete active[dueId];
                due.fn();
            }
            clock.now = target;
            return clock.now;
        },

        // Очистить все ожидающие callbacks.
        reset: function() {
            active = Object.create(null);
        }
    };

    return clock;
};

var createBrowserGlobals = function(clock) {
    return {
        window: {
            setTimeout: clock.setTimeout,
            clearTimeout: clock.clearTimeout
        },
        document: {},
        location: {},
        ActiveXObject: undefined
    };
};

module.exports = {
    createClock: createClock,
    createBrowserGlobals: createBrowserGlobals
};
