Bricks.Array = {};

/**
 * Возвращает последний элемент массива array.
 *
 * @param {Array} array
 *
 * @return {*}
 */
Bricks.Array.last = function(array) {
    return array.length ? array[array.length - 1] : undefined;
};

/**
 * Возвращает true, если переданный аргумент является массивом, иначе false.
 *
 * @param {*} obj
 *
 * @return {Boolean}
 */
Bricks.Array.isArray = function(obj) {
    return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};

Bricks.Array.flatten = function(input, depth, output) {
    output = output || [];
    if (!depth && depth !== 0) {
        depth = Infinity;
    } else if (depth <= 0) {
        return output.concat(input);
    }
    var idx = output.length;
    for (var i = 0; i < input.length; i++) {
        var value = input[i];
        if (Bricks.Array.isArray(value)) {
            if (depth > 1) {
                Bricks.Array.flatten(value, depth - 1, output);
                idx = output.length;
            } else {
                for (var j = 0; j < value.length; j++) {
                    output[idx++] = value[j];
                }
            }
        } else {
            output[idx++] = value;
        }
    }
    return output;
};

/**
 * Возвращает true, если все переданные аргументы, начиная со второго, присутствуют в массиве array.
 *
 * @param {Array} array
 *
 * @return {Boolean}
 */
Bricks.Array.include = function(array) {
    for (var i = 1; i < arguments.length; i++) {
        var include = false;
        for (var j = 0; j < array.length; j++) {
            if (arguments[i] === array[j]) {
                include = true;
                break;
            }
        }
        if (!include) {
            return false;
        }
    }
    return true;
};

/**
 * Перемешивает элементы массива array.
 *
 * @param {Array} array
 *
 * @return {Array} ссылка на array
 */
Bricks.Array.shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var num = Math.floor(Math.random() * (i + 1));
        var d = array[num];
        array[num] = array[i];
        array[i] = d;
    }
    return array;
};

Bricks.Array.pick = function(array) {
    return array[Math.floor(Math.random() * array.length)];
};
