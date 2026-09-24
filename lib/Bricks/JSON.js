Bricks.JSON = Bricks.JSON || {};

/**
 * Парсит JSON-строку json.
 *
 * @param {String} json JSON-строка.
 *
 * @return {*} Разобранное значение.
 *
 * @deprecated Используйте JSON.parse.
 */
Bricks.JSON.parse = function(json) {
    return JSON.parse(json);
};
