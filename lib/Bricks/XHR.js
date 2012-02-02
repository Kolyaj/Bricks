//#include index.js::isArray

//#if not buildjs
include('index.js');
//#endif

Bricks.XHR = {
    /**
     * Отправляет асинхронный HTTP-запрос на сервер.
     *
     * @param {String} method Метод запроса.
     * @param {String} url URL запроса. Может быть как относительный, так и абсолютный.
     * @param {String/Object} params Строка с параметрами в произвольном формате, либо хэш параметров,
     *      который приведётся к строке в формате urlencoded.
     * @param {Object} headers Хэш с заголовками запроса.
     * @param {Function} callback Callback-функция, вызываемая после получения ответа от сервера. При
     *      вызове передаются два параметра: содержимое свойства responseText объекта XMLHttpRequest и
     *      сам объект XMLHttpRequest.
     * @param {Object} ctx Контекст вызова для callback-функции.
     *
     * @return {XMLHttpRequest} Созданный объект XMLHttpRequest.
     */
    request: function(method, url, params, headers, callback, ctx) {
        url = url || location.href;
        params = params || '';
        if (typeof params != 'string') {
            params = this._encodeParams(params);
        }
        if (method.toLowerCase() == 'get') {
            url += (url.indexOf('?') > -1 ? '&' : '?') + params;
        }
        headers = headers || {};

        var xhr = this._createXHRObject();
        xhr.open(method, url, true);
        if (method.toLowerCase() == 'post' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback.call(ctx, xhr.responseText, xhr);
            }
        };
        xhr.send(method.toLowerCase() == 'post' ? params : null);
        return xhr;
    },

    arraySuffix: '[]',

    _createXHRObject: function() {
        return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Msxml2.XMLHTTP');
    },

    /**
     * Преобразует хэш параметров params в строку параметров в формате урла. Если значение параметра
     * является массивом, то к имени параметра добавляется значение настраиваемого свойства
     * Bricks.XHR.arraySuffix (по умолчанию '[]') и параметр повторяется столько раз, сколько элементов
     * в массиве.
     *
     * @param {Object} params Хэш с параметрами.
     *
     * @return {String} строка в форме параметров URL.
     */
    _encodeParams: function(params) {
        var pairs = [];
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var value = params[key];
                if (Bricks.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        pairs.push(encodeURIComponent(key) + Bricks.XHR.arraySuffix + '=' + encodeURIComponent(String(value[i])));
                    }
                } else {
                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
                }
            }
        }
        return pairs.join('&');
    }
};