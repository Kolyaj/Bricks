//#include index.js::create

//#include String.js::trim

Bricks.EventsController = Bricks.create({
    constructor: function() {
        this._listeners = {};
    },

    on: function(el, events, fn, ctx) {
        var names = events.split(',');
        for (var i = 0; i < names.length; i++) {
            var name = Bricks.String.trim(names[i]);
            this._listeners[name] = this._listeners[name] || [];
            var handler = function(evt) {
                fn.call(ctx, evt || window.event);
            };
            this._listeners[name].push([el, fn, ctx, handler]);
            if (el.addEventListener) {
                el.addEventListener(name, handler, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, handler);
            }
        }
    },

    un: function(el, events, fn, ctx) {
        var names = events.split(',');
        for (var i = 0; i < names.length; i++) {
            var name = Bricks.String.trim(names[i]);
            var listeners = this._listeners[name] || [];
            for (var j = 0; j < listeners.length; j++) {
                var listener = listeners[j];
                if (listener[0] == el && listener[1] == fn && listener[2] == ctx) {
                    listeners.splice(j, 1);
                    this._removeListener(el, name, listener[3]);
                    return;
                }
            }
        }
    },

    unAll: function() {
        for (var name in this._listeners) {
            if (this._listeners.hasOwnProperty(name)) {
                for (var i = 0; i < this._listeners[name].length; i++) {
                    this._removeListener(this._listeners[name][i][0], name, this._listeners[name][i][3]);
                }
                delete this._listeners[name];
            }
        }
    },


    _removeListener: function(el, name, fn) {
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, false);
        } else if (el.detachEvent) {
            el.detachEvent('on' + name, fn);
        }
    }
});
