/**
 * @class Bricks.Request
 * @extends Bricks.Component
 * @deprecated
 *
 * Класс для отправки HTTP-запроса: поддерживает обработчики событий complete, success, failure и status.
 */
Bricks.Request = Bricks.inherit(Bricks.Component, {
    /**
     * @type {String}
     * Метод запроса (GET, POST, ...).
     */
    method: 'GET',

    /**
     * @type {String}
     * URL запроса.
     */
    url: '/',

    /**
     * @type {Object}
     * URL-параметры запроса.
     */
    params: {},

    /**
     * @type {Object}
     * Тело запроса для методов POST и PUT.
     */
    postBody: {},

    /**
     * @type {Object}
     * Заголовки запроса.
     */
    headers: {},

    /**
     * @type {Boolean}
     * Если true, запрос отправляется сразу после создания экземпляра.
     */
    autoRun: true,

    _initComponent: function() {
        Bricks.Request.superclass._initComponent.apply(this, arguments);

        this._xhr = this._createXHRObject();
        this._complete = false;
        this._result = null;
        this._callbacksComplete = [];
        this._callbacksSuccess = [];
        this._callbacksFailure = [];
        this._callbacksStatus = {};
        this._method = String(this.method).toUpperCase();
        this._params = Bricks.mixin({}, this.params);
        this._headers = Bricks.mixin({}, this.headers);

        if (this._hasBody()) {
            this.setHeader('Content-Type', this._getContentType());
        }

        if (this.autoRun) {
            Bricks.Function.defer(this.run, 10, this);
        }
    },

    /**
     * Устанавливает URL-параметр запроса.
     *
     * @param {String} name Имя параметра.
     * @param {*} value Значение параметра.
     */
    setParam: function(name, value) {
        this._params[name] = value;
    },

    /**
     * Устанавливает заголовок запроса.
     *
     * @param {String} name Имя заголовка.
     * @param {String} value Значение заголовка.
     */
    setHeader: function(name, value) {
        this._headers[name] = value;
    },

    /**
     * Отправляет запрос. Если передан callback, он подвешивается как обработчик события complete.
     *
     * @param {Function} [callback] Обработчик события complete, получающий объект запроса.
     * @param {Object} [ctx] Контекст вызова обработчика.
     */
    run: function(callback, ctx) {
        if (callback) {
            this.onComplete(callback, ctx);
        }
        var url = this.url;
        var params = Bricks.QueryString.stringify(this._params);
        if (params) {
            url += (url.indexOf('?') > -1 ? '&' : '?') + params;
        }

        this._xhr.open(this._method, url, true);
        for (var header in this._headers) {
            if (this._headers.hasOwnProperty(header)) {
                this._xhr.setRequestHeader(header, this._headers[header]);
            }
        }
        this._xhr.onreadystatechange = Bricks.Function.bind(this._onReadyStateChange, this);
        this._xhr.send(this._hasBody() ? this._encodePostBody(this.postBody) : null);
    },

    /**
     * Возвращает объект XMLHttpRequest запроса.
     *
     * @return {XMLHttpRequest}
     */
    getXHRObject: function() {
        return this._xhr;
    },

    /**
     * Подписывает обработчик события complete: срабатывает при любом завершении запроса.
     *
     * @param {Function} callback Обработчик, получающий объект запроса.
     * @param {Object} [ctx] Контекст вызова обработчика.
     *
     * @return {Bricks.Request} Текущий объект, для вызовов последовательности.
     */
    onComplete: function(callback, ctx) {
        this._callbacksComplete.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    /**
     * Подписывает обработчик события success: срабатывает, если статус ответа 200.
     *
     * @param {Function} callback Обработчик, получающий объект запроса.
     * @param {Object} [ctx] Контекст вызова обработчика.
     *
     * @return {Bricks.Request} Текущий объект, для вызовов последовательности.
     */
    onSuccess: function(callback, ctx) {
        this._callbacksSuccess.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    /**
     * Подписывает обработчик события failure: срабатывает, если статус ответа не 200.
     *
     * @param {Function} callback Обработчик, получающий объект запроса.
     * @param {Object} [ctx] Контекст вызова обработчика.
     *
     * @return {Bricks.Request} Текущий объект, для вызовов последовательности.
     */
    onFailure: function(callback, ctx) {
        this._callbacksFailure.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    /**
     * Подписывает обработчик события status: срабатывает при указанном статусе HTTP-ответа.
     *
     * @param {Number} status Статус HTTP-ответа.
     * @param {Function} callback Обработчик, получающий объект запроса.
     * @param {Object} [ctx] Контекст вызова обработчика.
     *
     * @return {Bricks.Request} Текущий объект, для вызовов последовательности.
     */
    onStatus: function(status, callback, ctx) {
        if (!this._callbacksStatus[status]) {
            this._callbacksStatus[status] = [];
        }
        this._callbacksStatus[status].push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    /**
     * Возвращает true, если запрос завершён.
     *
     * @return {Boolean}
     */
    isComplete: function() {
        return this._complete;
    },

    /**
     * Возвращает true, если статус ответа 200.
     *
     * @return {Boolean}
     */
    isSuccess: function() {
        return this.getStatus() == 200;
    },

    /**
     * Возвращает статус HTTP-ответа.
     *
     * @return {Number} Статус или undefined, если запрос ещё не завершён.
     */
    getStatus: function() {
        return this._complete ? this._xhr.status : undefined;
    },

    /**
     * Возвращает содержимое ответа.
     *
     * @return {*} Разобранное содержимое или undefined, если запрос ещё не завершён.
     */
    getResult: function() {
        return this._complete ? this._result : undefined;
    },

    /**
     * Возвращает сырой текст ответа.
     *
     * @return {String} Свойство responseText объекта XMLHttpRequest или undefined, если запрос ещё не завершён.
     */
    getRawResult: function() {
        return this._complete ? this._xhr.responseText : undefined;
    },


    /**
     * @return {Boolean} true, если метод запроса POST или PUT.
     */
    _hasBody: function() {
        return this._method == 'POST' || this._method == 'PUT';
    },

    /**
     * @param {Object} params Хэш параметров тела запроса.
     *
     * @return {String} Строка параметров в формате urlencoded.
     */
    _encodePostBody: function(params) {
        return Bricks.QueryString.stringify(params);
    },

    /**
     * @return {String} MIME-тип тела запроса.
     */
    _getContentType: function() {
        return 'application/x-www-form-urlencoded';
    },

    /**
     * @param {String} responseText Текст ответа.
     *
     * @return {*} Разобранное содержимое ответа.
     */
    _parseResponse: function(responseText) {
        return responseText;
    },

    _resolveCallbacks: function() {
        if (this._complete) {
            this._fireCallbacks(this._callbacksComplete);
            this._fireCallbacks(this.isSuccess() ? this._callbacksSuccess : this._callbacksFailure);
            this._fireCallbacks(this._callbacksStatus[this.getStatus()] || []);
        }
    },

    /**
     * @param {Array} callbacks Список обработчиков в виде пар [callback, ctx]; список очищается после вызовов.
     */
    _fireCallbacks: function(callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i][0].call(callbacks[i][1], this);
        }
        callbacks.length = 0;
    },

    /**
     * @return {XMLHttpRequest} Новый объект XMLHttpRequest.
     */
    _createXHRObject: function() {
        return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Msxml2.XMLHTTP');
    },

    _onReadyStateChange: function() {
        if (this._xhr.readyState == 4) {
            this._xhr.onreadystatechange = null;
            this._complete = true;
            this._result = this._parseResponse(this._xhr.responseText);
            this._resolveCallbacks();
        }
    }
});
