//#include index.js::

Bricks.QueryString = {};

//#label parse
/**
 * Преобразует строку query в формате параметров URL в объект. Повторяющиеся элементы и элементы, имена которых
 * заканчиваются на параметр arraySuffix (по-умолчанию []), преобразуются в массив с удалением arraySuffix из имени.
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
                    var value = decode((pair[1] || '').replace(/\+/g, '%20'));
                    if (key in result) {
                        if (Object.prototype.toString.call(result[key]) == '[object Array]') {
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
//#endlabel parse

//#label stringify
//#include index.js::isArray
/**
 * Преобразует хэш параметров object в строку параметров в формате урла. Если значение свойства
 * является массивом, то к имени свойства добавляется значение параметра arraySuffix (по умолчанию '[]') и параметр
 * повторяется столько раз, сколько элементов в массиве.
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
//#endlabel stringify
