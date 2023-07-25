Bricks.EventsController = Bricks.create({
    constructor: function() {
        this._listeners = [];
        this._paused = false;
    },

    pause: function() {
        this._paused = true;
        for (var i = 0; i < this._listeners.length; i++) {
            var item = this._listeners[i];
            item[4].removeEventListener(item[5], item[6], false);
        }
    },

    resume: function() {
        this._paused = false;
        for (var i = 0; i < this._listeners.length; i++) {
            var item = this._listeners[i];
            item[4].addEventListener(item[5], item[6], false);
        }
    },

    on: function(el, events, fn, ctx) {
        events = this._normalizeEventTypes(events);
        var handler = function(evt) {
            return fn.call(ctx, evt || window.event);
        };
        for (var i = 0; i < events.length; i++) {
            var event = typeof events[i] === 'string' ? events[i] : 'action';
            var observable = typeof events[i] === 'string' ? el : new events[i](el);
            this._listeners.push([el, events[i], fn, ctx, observable, event, handler]);
            if (!this._paused) {
                observable.addEventListener(event, handler, false);
            }
        }
    },

    un: function(el, events, fn, ctx) {
        events = this._normalizeEventTypes(events);
        for (var i = 0; i < events.length; i++) {
            for (var j = 0; j < this._listeners.length; j++) {
                var item = this._listeners[j];
                if (item[0] === el && item[1] === events[i] && item[2] === fn && item[3] === ctx) {
                    this._listeners.splice(j, 1);
                    if (!this._paused) {
                        item[4].removeEventListener(item[5], item[6], false);
                    }
                    if (typeof item[1] === 'function' && typeof item[4].destroy === 'function') {
                        item[4].destroy();
                    }
                    break;
                }
            }
        }
    },

    unAll: function() {
        for (var i = 0; i < this._listeners.length; i++) {
            var item = this._listeners[i];
            if (!this._paused) {
                item[4].removeEventListener(item[5], item[6], false);
            }
            if (typeof item[1] === 'function' && typeof item[4].destroy === 'function') {
                item[4].destroy();
            }
        }
        this._listeners.length = 0;
    },


    _normalizeEventTypes: function(events) {
        if (!Bricks.isArray(events)) {
            events = [events];
        }
        var result = [];
        for (var i = 0; i < events.length; i++) {
            if (typeof events[i] === 'string') {
                var names = events[i].split(',');
                for (var j = 0; j < names.length; j++) {
                    result.push(Bricks.String.trim(names[j]));
                }
            } else if (typeof events[i] === 'function') {
                result.push(events[i]);
            } else {
                throw new TypeError('events parameter must be a string, a constructor or an array of strings and/or constructors.');
            }
        }
        return result;
    }
});
