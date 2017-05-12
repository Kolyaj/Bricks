//#include index.js::

Bricks.Array = {};

//#label last
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
//#endlabel last

//#label include
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
//#endlabel include

//#label shuffle
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
//#endlabel shuffle

//#label pick
Bricks.Array.pick = function(array) {
    return array[Math.floor(Math.random() * array.length)];
};
//#endlabel pick
