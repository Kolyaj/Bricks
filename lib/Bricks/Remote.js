/**
 * @class Bricks.Remote
 * @extends Bricks.Component
 *
 * Метод для отправки асинхронных HTTP-запросов. Базовые URL-параметры, параметры тела запроса и заголовки
 * задаются в конфиге и в цепочке прототипов, поэтому классы-наследники могут добавлять свои значения.
 */
Bricks.Remote = Bricks.inherit(Bricks.Component, {
    /**
     * @type {Object}
     * Базовые URL-параметры (query string), распространяющиеся на все запросы.
     */
    getParams: {},

    /**
     * @type {Object}
     * Базовые параметры тела запроса, распространяющиеся на POST и PUT.
     */
    postParams: {},

    /**
     * @type {Object}
     * Базовые заголовки запроса.
     */
    headers: {},

    /**
     * @type {String}
     * Тип содержимого тела запроса.
     */
    contentType: 'application/x-www-form-urlencoded',

    _initComponent: function() {
        Bricks.Remote.superclass._initComponent.apply(this, arguments);
        this._getParams = this._grabProtoProps('getParams');
        this._postParams = this._grabProtoProps('postParams');
        this._headers = this._grabProtoProps('headers');
    },

    /**
     * Устанавливает URL-параметр, распространяющийся на все запросы экземпляра.
     *
     * @param {String} name Имя параметра.
     * @param {*} value Значение параметра.
     */
    setGetParam: function(name, value) {
        this._getParams[name] = value;
    },

    /**
     * Устанавливает параметр тела запроса, распространяющийся на все POST и PUT экземпляра.
     *
     * @param {String} name Имя параметра.
     * @param {*} value Значение параметра.
     */
    setPostParam: function(name, value) {
        this._postParams[name] = value;
    },

    /**
     * Устанавливает заголовок, распространяющийся на все запросы экземпляра.
     *
     * @param {String} name Имя заголовка.
     * @param {String} value Значение заголовка.
     */
    setHeader: function(name, value) {
        this._headers[name] = value;
    },

    /**
     * Отправляет HTTP-запрос. Переданные getParams, postParams и headers расширяют значения из конфига
     * и цепочки прототипов; при конфликте выигрывают переданные параметры и заголовки. Для POST и PUT
     * в тело запроса отправляется postParams.
     *
     * @param {String} method Метод запроса (GET, POST, PUT, ...).
     * @param {String} url URL запроса.
     * @param {Object} [getParams] Дополнительные URL-параметры для этого запроса.
     * @param {Object} [postParams] Дополнительные параметры тела для этого запроса.
     * @param {Object} [headers] Дополнительные заголовки для этого запроса.
     * @param {Function} [callback] Функция, вызываемая по завершении запроса. Получает два параметра:
     *      разобранный ответ (JSON-объект при Content-Type application/json, иначе текст) и объект XMLHttpRequest.
     * @param {Object} [ctx] Контекст вызова callback.
     */
    request: function(method, url, getParams, postParams, headers, callback, ctx) {
        var getParamsStr = Bricks.QueryString.stringify(Bricks.mixin({}, this._getParams, getParams || {}));
        if (getParamsStr) {
            url += (url.indexOf('?') > -1 ? '&' : '?') + getParamsStr;
        }
        headers = Bricks.mixin({}, this._headers, headers);

        var xhr = this._createXHRObject();
        xhr.open(method, url, true);
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        var that = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = null;
                if (callback) {
                    callback.call(ctx, xhr.status === 200 ? that._parseResponse(xhr) : null, xhr);
                }
            }
        };
        if (method === 'POST' || method === 'PUT') {
            xhr.setRequestHeader('Content-Type', this.contentType);
            xhr.send(this._encodePostParams(Bricks.mixin({}, this._postParams, postParams || {})));
        } else {
            xhr.send(null);
        }
    },

    /**
     * Отправляет GET-запрос.
     *
     * @param {String} url URL запроса.
     * @param {Object} [params] URL-параметры.
     * @param {Function} [callback] Функция, вызываемая по завершении запроса. Получает разобранный ответ и объект XMLHttpRequest.
     * @param {Object} [ctx] Контекст вызова callback.
     */
    get: function(url, params, callback, ctx) {
        return this.request('GET', url, params, null, {}, callback, ctx);
    },

    /**
     * Отправляет POST-запрос.
     *
     * @param {String} url URL запроса.
     * @param {Object} [params] Параметры тела запроса.
     * @param {Function} [callback] Функция, вызываемая по завершении запроса. Получает разобранный ответ и объект XMLHttpRequest.
     * @param {Object} [ctx] Контекст вызова callback.
     */
    post: function(url, params, callback, ctx) {
        return this.request('POST', url, null, params, {}, callback, ctx);
    },


    /**
     * @param {XMLHttpRequest} xhr Завершившийся запрос.
     *
     * @return {*} JSON-объект, если Content-Type ответа application/json, иначе текст ответа.
     */
    _parseResponse: function(xhr) {
        var contentType = xhr.getResponseHeader('Content-Type') || '';
        if (contentType.indexOf('application/json') === 0) {
            return JSON.parse(xhr.responseText, function(k, v) {
                return typeof v == 'string' && /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/.test(v) ? new Date(v) : v;
            });
        } else {
            return xhr.responseText;
        }
    },

    /**
     * @param {Object} postParams Хэш параметров тела запроса.
     *
     * @return {String} Строка параметров в формате urlencoded.
     */
    _encodePostParams: function(postParams) {
        return Bricks.QueryString.stringify(postParams);
    },

    /**
     * @param {String} prop Имя свойства.
     *
     * @return {Object} Объединённое значение свойства из цепочки прототипов: ближе к экземпляру — выше приоритет.
     */
    _grabProtoProps: function(prop) {
        var values = Bricks.getPrototypeChain(this, prop).reverse().map(function(proto) {
            return proto[prop];
        });
        values.unshift({});
        return Bricks.mixin.apply(Bricks, values);
    },

    /**
     * @return {XMLHttpRequest} Новый объект XMLHttpRequest.
     */
    _createXHRObject: function() {
        return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Msxml2.XMLHTTP');
    }
});
