//#include index.js::base

Bricks.Function = {
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
    defer: function(fn, delay, ctx, args) {
        return window.setTimeout(function() {
            fn.apply(ctx, args || []);
        }, delay);
    },
    //#endlabel defer

    '': ''
};