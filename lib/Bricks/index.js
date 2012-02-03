//#set buildjs
//#if false
function include(fname) {
    // Это чтобы IDE не ругалась на несуществующую функцию.
}
//#endif

var Bricks = {
    //#label isArray
    /**
     * Возвращает true, если переданный аргумент является массивом, иначе false.
     *
     * @param {*} obj
     *
     * @return {Boolean}
     */
    isArray: function(obj) {
        return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) == '[object Array]';
    },
    //#endlabel isArray

    //#label mixin
    /**
     * Копирует свойства из всех аргументов, начиная со второго, в dst.
     *
     * @param {Object} dst Объект, в который копируются свойства.
     *
     * @return {Object} Объект dst.
     */
    mixin: function(dst) {
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i]) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        dst[prop] = arguments[i][prop];
                    }
                }
                if (arguments[i].hasOwnProperty('toString')) {
                    dst['toString'] = arguments[i]['toString'];
                }
            }
        }
        return dst;
    },
    //#endlabel mixin

    //#label create
    /**
     * Создаёт конструктор, прототип которого наследует прототип текущего конструктора.
     * Для создания ничего не наследующего конструктора следует использовать Bricks.create({...}).
     *
     * @param {Object} proto Объект с методами и свойствами, копирующимися в прототип создаваемого конструктора.
     *
     * @return {Function} Созданный конструктор.
     */
    create: function(proto) {
        proto = proto || {};
        var parent = typeof this == 'function' ? this : Object;
        if (!proto.hasOwnProperty('constructor')) {
            proto.constructor = function() {
                parent.apply(this, arguments);
            };
        }
        var F = function() {};
        F.prototype = parent.prototype;
        proto.constructor.prototype = new F();
        for (var name in proto) {
            if (proto.hasOwnProperty(name)) {
                proto.constructor.prototype[name] = proto[name];
            }
        }
        proto.constructor.superclass = parent.prototype;
        proto.constructor.inherit = Bricks.create;
        return proto.constructor;
    },
    //#endlabel create

    '': ''
};