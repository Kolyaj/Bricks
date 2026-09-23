Bricks.QueryString = Bricks.QueryString || {};

/**
 * Преобразует строку query в формате параметров URL в объект. Повторяющиеся параметры преобразуются в массив.
 *
 * @param {String} query Преобразуемая строка.
 *
 * @return {Object} Хэш с параметрами.
 */
Bricks.QueryString.parse = function(query) {
    var result = {};
    var decode = decodeURIComponent;
    if (query.length) {
        var parts = query.split('&');
        for (var i = 0; i < parts.length; i++) {
            if (parts[i]) {
                var pair = parts[i].split('=');
                if (pair[0]) {
                    var key = decode(pair[0]);
                    var value = decode(pair.slice(1).join('=').replace(/\+/g, '%20'));
                    if (key in result) {
                        if (Bricks.Array.isArray(result[key])) {
                            result[key].push(value);
                        } else {
                            result[key] = [result[key], value];
                        }
                    } else {
                        result[key] = value;
                    }
                }
            }
        }
    }
    return result;
};

/**
 * Преобразует хэш параметров object в строку параметров в формате URL. Если значение свойства
 * является массивом, то параметр повторяется столько раз, сколько элементов в массиве.
 *
 * @param {Object} object Хэш с параметрами.
 *
 * @return {String} Закодированная строка.
 */
Bricks.QueryString.stringify = function(object) {
    var encode = encodeURIComponent;
    var pairs = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            var value = object[key];
            if (Bricks.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    pairs.push(encode(key) + '=' + encode(String(value[i])));
                }
            } else {
                pairs.push(encode(key) + '=' + encode(String(value)));
            }
        }
    }
    return pairs.join('&');
};
