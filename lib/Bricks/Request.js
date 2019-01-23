Bricks.Request = Bricks.Component.inherit({
    method: 'GET',

    url: '/',

    params: {},

    postBody: {},

    headers: {},

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

    setParam: function(name, value) {
        this._params[name] = value;
    },

    setHeader: function(name, value) {
        this._headers[name] = value;
    },

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

    getXHRObject: function() {
        return this._xhr;
    },

    onComplete: function(callback, ctx) {
        this._callbacksComplete.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    onSuccess: function(callback, ctx) {
        this._callbacksSuccess.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    onFailure: function(callback, ctx) {
        this._callbacksFailure.push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    onStatus: function(status, callback, ctx) {
        if (!this._callbacksStatus[status]) {
            this._callbacksStatus[status] = [];
        }
        this._callbacksStatus[status].push([callback, ctx]);
        this._resolveCallbacks();
        return this;
    },

    isComplete: function() {
        return this._complete;
    },

    isSuccess: function() {
        return this.getStatus() == 200;
    },

    getStatus: function() {
        return this._complete ? this._xhr.status : undefined;
    },

    getResult: function() {
        return this._complete ? this._result : undefined;
    },

    getRawResult: function() {
        return this._complete ? this._xhr.responseText : undefined;
    },


    _hasBody: function() {
        return this._method == 'POST' || this._method == 'PUT';
    },

    _encodePostBody: function(params) {
        return Bricks.QueryString.stringify(params);
    },

    _getContentType: function() {
        return 'application/x-www-form-urlencoded';
    },

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

    _fireCallbacks: function(callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i][0].call(callbacks[i][1], this);
        }
        callbacks.length = 0;
    },

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
