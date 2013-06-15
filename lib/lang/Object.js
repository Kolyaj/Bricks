//#label keys
if (!Object.keys) {
    /**
     * Возвращает массив ключей объекта. В результирующем массиве присутствуют только те ключи, которые имеются
     * в самом объекте, а не в цепочке прототипов.
     *
     * @param {Object} obj
     *
     * @return {Array}
     */
    Object.keys = function(obj) {
        var keys = [];
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}
//#endlabel keys
