Bricks.Remote = Bricks.Component.inherit({
    getParams: {},

    postParams: {},

    headers: {},

    contentType: 'application/x-www-form-urlencoded',

    _initComponent: function() {
        Bricks.Remote.superclass._initComponent.apply(this, arguments);
        this._getParams = this._grabProtoProps('getParams');
        this._postParams = this._grabProtoProps('postParams');
        this._headers = this._grabProtoProps('headers');
    },

    setGetParam: function(name, value) {
        this._getParams[name] = value;
    },

    setPostParam: function(name, value) {
        this._postParams[name] = value;
    },

    setHeader: function(name, value) {
        this._headers[name] = value;
    },

    request: function(method, url, getParams, postParams, headers, callback, ctx) {
        var getParamsStr = Bricks.QueryString.stringify(Bricks.mixin({}, this._getParams, getParams || {}));
        if (getParamsStr) {
            url += (url.indexOf('?') > -1 ? '&' : '?') + getParamsStr;
        }
        headers = Bricks.mixin({}, headers, this._headers);

        var xhr = this._createXHRObject();
        xhr.open(method, url, true);
        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        var that = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = null;
                if (xhr.status == 200) {
                    callback.call(ctx, that._parseResponse(xhr), xhr);
                } else {
                    callback.call(ctx, null, xhr);
                }
            }
        };
        if (method == 'POST' || method == 'PUT') {
            xhr.setRequestHeader('Content-Type', this.contentType);
            xhr.send(this._encodePostParams(postParams));
        } else {
            xhr.send(null);
        }
    },

    get: function(url, params, callback, ctx) {
        return this.request('GET', url, params, null, {}, callback, ctx);
    },

    post: function(url, params, callback, ctx) {
        return this.request('POST', url, null, params, {}, callback, ctx);
    },


    _parseResponse: function(xhr) {
        var contentType = xhr.getResponseHeader('Content-Type') || '';
        if (contentType.indexOf('application/json') == 0) {
            return Bricks.JSON.parse(xhr.responseText, function(k, v) {
                return typeof v == 'string' && /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/.test(v) ? new Date(v) : v;
            });
        } else {
            return xhr.responseText;
        }
    },

    _encodePostParams: function(postParams) {
        return Bricks.QueryString.stringify(postParams);
    },

    _grabProtoProps: function(prop) {
        var values = Bricks.getPrototypeChain(this, prop).reverse().map(function(proto) {
            return proto[prop];
        });
        values.unshift({});
        return Bricks.mixin.apply(Bricks, values);
    },

    _createXHRObject: function() {
        return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Msxml2.XMLHTTP');
    }
});
