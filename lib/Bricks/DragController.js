//#include index.js
//#include Component.js

//#include DOM.js::getEl
//#include Event.js::getPos::stop
//#include EventsController.js

//#define $_ Bricks_DragController_

Bricks.DragController = Bricks.Component.inherit({
    el: null,


    _initComponent: function() {
        Bricks.DragController.superclass._initComponent.apply(this, arguments);
        this._el = Bricks.DOM.getEl(this.el);
        this._doc = this._el.ownerDocument;
        this._events = new Bricks.EventsController();
        this._lastPos = null;

        this._events.on(this._el, 'mousedown,touchstart', this.$__onMouseDown, this);
    },

    destroy: function() {
        this._events.unAll();
    },


    $__onMouseDown: function(evt) {
        var isTouch = evt.type == 'touchstart';
        this._lastPos = Bricks.Event.getPos(evt);
        if (isTouch && evt.touches.length > 1) {
            return;
        }
        if (this._fireEvent('start', {event: evt})) {
            this._events.on(this._doc, isTouch ? 'touchmove' : 'mousemove', this.$__onMouseMove, this);
            this._events.on(this._doc, isTouch ? 'touchend' : 'mouseup', this.$__onMouseUp, this);
            Bricks.Event.stop(evt);
        }
    },

    $__onMouseMove: function(evt) {
        var curPos = Bricks.Event.getPos(evt);
        var delta = [curPos[0] - this._lastPos[0], curPos[1] - this._lastPos[1]];
        this._fireEvent('move', {
            event: evt,
            currentPos: curPos,
            lastPos: this._lastPos,
            delta: delta
        });
        this._lastPos = curPos;
    },

    $__onMouseUp: function(evt) {
        this._fireEvent('end', {event: evt});
        this._events.un(this._doc, 'mousemove,touchmove', this.$__onMouseMove, this);
        this._events.un(this._doc, 'mouseup,touchend', this.$__onMouseUp, this);
    }
});
