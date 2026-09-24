// Node-встроенные сущности тестового харнесса (ADR 0003).
//
// createClock() — детерминированные fake-часы: в сьюите нет реального
// времени, тест продвигает время вручную (clock.tick(ms)). sinon в Node не нужен.
//
// createBrowserGlobals(clock) — базовая среда сьюита: window/document —
// modern-профили (test/profile). Тесты, которым нужна другая форма
// host-объекта, получают её от фабрик Profiles.* напрямую (каждая фабрика
// возвращает новый объект). Тесты мутируют только те профили, которые сами
// создали. Lib-файлы на require не ссылаются: lib самодостаточен, тестовые
// файлы используют только инъекты.

var BricksTest = require('../profile');

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
            clearTimeout: clock.clearTimeout,
            // Профиль XHR-конструктора: ветку new XMLHttpRequest() Remote
            // добирает с globalThis (XMLHttpRequest не в списке инъекций).
            XMLHttpRequest: BricksTest.Profiles.xhr
        },
        document: BricksTest.Profiles.doc.modern(),
        location: {},
        ActiveXObject: undefined
    };
};

module.exports = {
    createClock: createClock,
    createBrowserGlobals: createBrowserGlobals
};
