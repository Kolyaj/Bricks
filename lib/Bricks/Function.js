Bricks.Function = {};

//#label defer
/**
 * Вызывает функцию fn через delay миллисекунд в контексте ctx с аргументами args.
 *
 * @param {Function} fn
 * @param {Number} delay
 * @param {Object} [ctx]
 * @param {Array} [args]
 *
 * @return {Number} Идентификатор таймаута.
 */
Bricks.Function.defer = function(fn, delay, ctx, args) {
    return window.setTimeout(function() {
        fn.apply(ctx, args || []);
    }, delay);
};
//#endlabel defer

//#label bind
/**
 * Создает функцию, вызывающую функцию fn в контексте ctx, передавая ей остальные переданные параметры.
 *
 * @param {Function} fn Вызываемая функция.
 * @param {Object} ctx Объект, в контексте которого будет вызываться функция.
 *
 * @return {Function} Новая функция.
 */
Bricks.Function.bind = function(fn, ctx) {
    var args = [].slice.call(arguments, 2);
    return function() {
        return fn.apply(ctx || this, args.concat([].slice.call(arguments, 0)));
    };
};
//#endlabel bind

//#label debounce
/**
 * Возвращает функцию, вызывающую функцию fn с задержкой delay в контексте ctx. Если во время задержки функция
 * была вызвана еще раз, то предыдующий вызов отменяется, а таймер обновляется. Таким образом из нескольких
 * вызовов, совершающихся чаще, чем delay, реально будет вызван только последний.
 *
 * @param {Function} fn
 * @param {Number} delay
 * @param {Object} [ctx]
 *
 * @return {Function}
 */
Bricks.Function.debounce = function(fn, delay, ctx) {
    var timer;
    return function() {
        var args = arguments;
        var that = this;
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn.apply(ctx || that, args);
        }, delay);
    };
};
//#endlabel debounce

//#label throttle
/**
 * Возвращает функцию, вызывающую функцию fn не чаще delay в контексте ctx. В отличие от {@link Bricks.Function.debounce}
 * первый вызов происходит сразу.
 *
 * @param {Function} fn
 * @param {Number} delay
 * @param {Object} [ctx]
 *
 * @return {Function}
 */
Bricks.Function.throttle = function(fn, delay, ctx) {
    var timer;
    var args;
    var that;
    return function() {
        args = arguments;
        that = this;
        if (!timer) {
            (function() {
                timer = null;
                if (args) {
                    fn.apply(ctx || that, args);
                    args = null;
                    timer = setTimeout(arguments.callee, delay);
                }
            })();
        }
    };
};
//#endlabel throttle
