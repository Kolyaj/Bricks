/**
 * @class Bricks.DragController
 * @extends Bricks.Component
 *
 * Контроллер перетаскивания: отслеживает mouse и touch события на элементе el и генерирует события
 * 'start', 'move' и 'end'. Логика перемещения элемента реализуется в подписчиках этих событий.
 */
Bricks.DragController = Bricks.inherit(Bricks.Component, {
    /**
     * @type {Node/String}
     * Элемент, перетаскивание которого контролирует контроллер, или его id.
     */
    el: null,

    /**
     * @type {Boolean}
     * Если true, отслеживаются не только mouse, но и touch события.
     */
    touchEnabled: true,


    _initComponent: function() {
        Bricks.DragController.superclass._initComponent.apply(this, arguments);
        this._el = Bricks.DOM.getEl(this.el);
        this._doc = this._el.ownerDocument;
        this._events = new Bricks.EventsController();
        this._lastPos = null;
        this._dragMode = false;

        var eventName = 'mousedown';
        if (this.touchEnabled) {
            eventName += ',touchstart';
        }
        this._events.on(this._el, eventName, this.$$_onMouseDown, this);
    },

    /**
     * Уничтожает контроллер: снимает все навешенные обработчики.
     */
    destroy: function() {
        this._events.unAll();
    },


    $$_onMouseDown: function(evt) {
        if (!this._dragMode) {
            var isTouch = evt.type === 'touchstart';
            this._lastPos = Bricks.Event.getPos(evt);
            if (!isTouch || evt.touches.length === 1) {
                if (this._fireEvent('start', {event: evt})) {
                    this._dragMode = true;
                    this._events.on(this._doc, isTouch ? 'touchmove' : 'mousemove', this.$$_onMouseMove, this);
                    this._events.on(this._doc, isTouch ? 'touchend' : 'mouseup', this.$$_onMouseUp, this);
                    Bricks.Event.stop(evt);
                }
            }
        }
    },

    $$_onMouseMove: function(evt) {
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

    $$_onMouseUp: function(evt) {
        this._fireEvent('end', {event: evt});
        this._dragMode = false;
        this._events.un(this._doc, 'mousemove,touchmove', this.$$_onMouseMove, this);
        this._events.un(this._doc, 'mouseup,touchend', this.$$_onMouseUp, this);
    }
});
