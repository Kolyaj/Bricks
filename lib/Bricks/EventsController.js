/**
 * @class Bricks.EventsController
 *
 * Контроллер подписки на события: отслеживает навешенные обработчики для их точного снятия по одному
 * или всех сразу, поддерживает паузу и возобновление подписки.
 */
Bricks.EventsController = Bricks.create({
    constructor: function() {
        this._listeners = [];
        this._paused = false;
    },

    /**
     * Временно снимает с объектов все навешенные обработчики. Для возврата вызывается {@link Bricks.EventsController.resume}.
     */
    pause: function() {
        if (!this._paused) {
            this._paused = true;
            for (var i = 0; i < this._listeners.length; i++) {
                var item = this._listeners[i];
                item[4].removeEventListener(item[5], item[6], false);
            }
        }
    },

    /**
     * Возвращает обработчики, снятые методом {@link Bricks.EventsController.pause}.
     */
    resume: function() {
        if (this._paused) {
            this._paused = false;
            for (var i = 0; i < this._listeners.length; i++) {
                var item = this._listeners[i];
                item[4].addEventListener(item[5], item[6], false);
            }
        }
    },

    /**
     * Навешивает обработчик fn на события events, перечисленные через запятую, для объекта el.
     * Обработчик вызывается в контексте ctx. Если в events передан конструктор, создаётся его экземпляр
     * с el в качестве аргумента, и слушается событие 'action' у этого экземпляра.
     *
     * @param {Object} el Объект, на который навешивается обработчик (DOM-элемент или объект с addEventListener).
     * @param {String|Function|Array} events Имена событий через запятую, конструктор события или массив из них.
     * @param {Function} fn Обработчик события.
     * @param {Object} [ctx] Контекст вызова обработчика.
     */
    on: function(el, events, fn, ctx) {
        events = this._normalizeEventTypes(events);
        var handler = function(evt) {
            return fn.call(ctx, evt || window.event);
        };
        for (var i = 0; i < events.length; i++) {
            var event = typeof events[i] === 'string' ? events[i] : 'action';
            var observable = typeof events[i] === 'string' ? el : new events[i](el);
            this._listeners.push([el, events[i], fn, ctx, observable, event, handler]);
            if (!this._paused) {
                observable.addEventListener(event, handler, false);
            }
        }
    },

    /**
     * Снимает обработчик, навешенный методом {@link Bricks.EventsController.on}. Параметры должны совпадать
     * с параметрами подписки. Экземпляр события, созданный через конструктор, уничтожается.
     *
     * @param {Object} el Объект, от которого снимается обработчик.
     * @param {String|Function|Array} events Имена событий через запятую, конструктор события или массив из них.
     * @param {Function} fn Снимаемый обработчик.
     * @param {Object} [ctx] Контекст вызова обработчика.
     */
    un: function(el, events, fn, ctx) {
        events = this._normalizeEventTypes(events);
        for (var i = 0; i < events.length; i++) {
            for (var j = 0; j < this._listeners.length; j++) {
                var item = this._listeners[j];
                if (item[0] === el && item[1] === events[i] && item[2] === fn && item[3] === ctx) {
                    this._listeners.splice(j, 1);
                    if (!this._paused) {
                        item[4].removeEventListener(item[5], item[6], false);
                    }
                    if (typeof item[1] === 'function' && typeof item[4].destroy === 'function') {
                        item[4].destroy();
                    }
                    break;
                }
            }
        }
    },

    /**
     * Снимает все навешенные обработчики.
     */
    unAll: function() {
        for (var i = 0; i < this._listeners.length; i++) {
            var item = this._listeners[i];
            if (!this._paused) {
                item[4].removeEventListener(item[5], item[6], false);
            }
            if (typeof item[1] === 'function' && typeof item[4].destroy === 'function') {
                item[4].destroy();
            }
        }
        this._listeners.length = 0;
    },


    /**
     * @param {String|Function|Array} events Имена событий через запятую, конструктор события или массив из них.
     *
     * @return {Array} Нормализованный список событий.
     */
    _normalizeEventTypes: function(events) {
        if (!Bricks.isArray(events)) {
            events = [events];
        }
        var result = [];
        for (var i = 0; i < events.length; i++) {
            if (typeof events[i] === 'string') {
                var names = events[i].split(',');
                for (var j = 0; j < names.length; j++) {
                    result.push(Bricks.String.trim(names[j]));
                }
            } else if (typeof events[i] === 'function') {
                result.push(events[i]);
            } else {
                throw new TypeError('events parameter must be a string, a constructor or an array of strings and/or constructors.');
            }
        }
        return result;
    }
});
