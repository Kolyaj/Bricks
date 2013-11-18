//#include index.js::mixin::create

/**
 * @class Bricks.Observer
 * @extends Object
 *
 * Класс, предоставляющий интерфейс для генерации событий и для добавления слушателей. Нет никакого жесткого
 * списка событий, которые может генерировать данный класс. Типом события является обычная строка.
 * Подписчики вызываются в обратном порядке, в котором они были подписаны. Если в одном из обработчиков
 * произойдет ошибка, вызовется метод {@link Bricks.Observer._handleListenerError} текущего обсервера, которому будет передан
 * объект ошибки, остальные обработчики будут вызваны в штатном режиме.
 * Подписчикам передаётся объект с обязательными свойствами type и target, расширенный свойствами объекта, переданного
 * вторым аргументом в функцию {@link Bricks.Observer._fireEvent}.
 * Чтобы остановить обработку события, обработчик должен вернуть false.
 * Для объектов, порожденных Bricks.Observer, можно также использовать {@link Bricks.DOM.on} для навешивания
 * обработчиков.
 */
Bricks.Observer = Bricks.create({
    /**
     * @constructor
     */
    constructor: function() {
        this.Bricks_Observer__listeners = {};
    },

    /**
     * Подписывает на событие.
     *
     * @param {String} name Имя события.
     * @param {Function} fn Фукнция, вызываемая при возникновении события.
     */
    addEventListener: function(name, fn) {
        this.Bricks_Observer__listeners[name] = this.Bricks_Observer__listeners[name] || [];
        this.Bricks_Observer__listeners[name].push(fn);
    },

    /**
     * Отписка от события. Параметры должны быть в точности теми же, что и при подписке.
     *
     * @param {String} name Имя события.
     * @param {Function} fn Подписанный обработчик.
     */
    removeEventListener: function(name, fn) {
        if (this.Bricks_Observer__listeners[name]) {
            for (var i = 0; i < this.Bricks_Observer__listeners[name].length; i++) {
                if (this.Bricks_Observer__listeners[name][i] == fn) {
                    this.Bricks_Observer__listeners[name].splice(i, 1);
                    i--;
                }
            }
        }
    },

    /**
     * Посылает событие name с параметрами data.
     *
     * @param {String} name Имя события.
     * @param {Object} [data] Параметры, расширяемые передаваемый в обработчики объект события.
     *
     * @return {Boolean} false, если событие было остановлено, иначе true.
     */
    _fireEvent: function(name, data) {
        var listeners = this.Bricks_Observer__listeners[name] || [];
        if (this.Bricks_Observer__listeners['*']) {
            listeners = listeners.concat(this.Bricks_Observer__listeners['*']);
        }
        var evt = Bricks.mixin({}, data, {
            type: name,
            target: this
        });
        for (var i = listeners.length - 1; i >= 0; i--) {
            try {
                if (listeners[i].call(this, evt) === false) {
                    return false;
                }
            } catch (err) {
                this._handleListenerError(err);
            }
        }
        return true;
    },

    /**
     * Обработчик ошибок, возникающих в подписчиках. По умолчанию бросает исключение в отдельном потоке, не
     * прерывая текущий. При желании можно переопределить данный метод, чтобы, например, логировать ошибки.
     *
     * @param {Error} err Объект ошибки.
     */
    _handleListenerError: function(err) {
        setTimeout(function() { throw err; }, 10);
    }
});
