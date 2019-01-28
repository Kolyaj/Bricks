var Bricks = {};

/**
 * Возвращает true, если переданный аргумент является массивом, иначе false.
 *
 * @param {*} obj
 *
 * @return {Boolean}
 */
Bricks.isArray = function(obj) {
    return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) == '[object Array]';
};

/**
 * Копирует свойства из всех аргументов, начиная со второго, в dst.
 *
 * @param {Object} dst Объект, в который копируются свойства.
 *
 * @return {Object} Объект dst.
 */
Bricks.mixin = function(dst) {
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
};

/**
 * Создаёт конструктор, прототип которого наследует прототип текущего конструктора.
 * Для создания ничего не наследующего конструктора следует использовать Bricks.create({...}).
 *
 * @param {Object|Function} proto Объект с методами и свойствами, копирующимися в прототип создаваемого конструктора.
 *
 * @return {Function} Созданный конструктор.
 */
Bricks.create = function(proto) {
    proto = proto || {};
    var parent = typeof this == 'function' ? this : Object;
    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor : function() {
        parent.apply(this, arguments);
    };
    var F = function() {};
    F.prototype = parent.prototype;
    ctor.prototype = new F();
    Bricks.mixin(ctor.prototype, typeof proto == 'function' ? proto(parent.prototype) : proto);
    ctor.prototype.constructor = ctor;
    ctor.superclass = parent.prototype;
    ctor.inherit = Bricks.create;
    if (typeof proto == 'function') {
        ctor.reinherit = function(anotherParent) {
            return anotherParent.inherit(proto);
        };
    }
    return ctor;
};

/**
 * Создаёт конструктор, прототип которого наследует прототип конструктора parent.
 *
 * @param {Function} [parent] Наследуемый конструктор
 * @param {Object} [proto] Объект с методами и свойствами, копирующимися в прототип создаваемого конструктора.
 *
 * @return {Function} Созданный конструктор.
 */
Bricks.inherit = function(parent, proto) {
    if (arguments.length === 0) {
        parent = Object;
        proto = {};
    } else if (arguments.length === 1) {
        if (typeof parent === 'function') {
            proto = {};
        } else {
            proto = parent;
            parent = Object;
        }
    } else {
        parent = parent || Object;
        proto = proto || {};
    }
    var ctor = proto.hasOwnProperty('constructor') ? proto.constructor : function() {
        parent.apply(this, arguments);
    };
    var F = function() {};
    F.prototype = parent.prototype;
    ctor.prototype = new F();
    Bricks.mixin(ctor.prototype, proto);
    ctor.prototype.constructor = ctor;
    ctor.superclass = parent.prototype;
    return ctor;
};

/**
 * Возвращает цепочку прототипов от object до корневого прототипа. Если указан prop, то в цепочку прототипов попадут только объекты, содержащие это свойство.
 * Функция использует свойство superclass, поэтому может использоваться только для конструкторов, созданных с помощью {@link Bricks.create}
 *
 * @param {Object} object
 * @param {String} [prop]
 *
 * @return {Object[]} массив объектов.
 */
Bricks.getPrototypeChain = function(object, prop) {
    var result = !prop || object.hasOwnProperty(prop) ? [object] : [];
    var proto = object.constructor.prototype;
    while (proto) {
        if (!prop || proto.hasOwnProperty(prop)) {
            result.push(proto);
        }
        proto = proto.constructor.superclass;
    }
    return result;
};

/**
 * Возвращает массив, содержащий count последовательных чисел, начиная со start. Если передан только один
 * аргумент, то он считается количеством элементов, а отсчет производится с нуля.
 *
 * @param {Number} start Стартовое число.
 * @param {Number} [count] Количество элементов.
 *
 * @return {Array} Массив последовательных чисел.
 */
Bricks.range = function(start, count) {
    if (arguments.length < 2) {
        count = start || 0;
        start = 0;
    }
    var a = [];
    for (var i = start; i < start + count; i++) {
        a.push(i);
    }
    return a;
};

/**
 * Генерирует случайное число в диапазоне от start до end. Если передан только один аргумент, то он считается
 * верхней границей, а нижняя при этом 0.
 *
 * @param {Number} start Нижняя граница диапазона генерируемых значений.
 * @param {Number} [end] Верхняя граница диапазона.
 *
 * @return {Number}
 */
Bricks.rand = function(start, end) {
    if (arguments.length === 1) {
        end = start;
        start = 0;
    }
    return Math.floor(Math.random() * (end - start + 1)) + start;
};
