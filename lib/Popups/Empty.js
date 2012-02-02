//#include index.js
//#include ../Bricks/Widget.js

//#include ../Bricks/Function.js::defer
//#include ../Bricks/DOM.js::getEl::getPos::getSize::getDocumentScroll::getViewportSize::getDocumentSize
//#include ../Bricks/index.js::isArray
//#include ../Bricks/Event.js::getTarget

//#if not buildjs
include('index.js');
include('../Bricks/Widget.js');

include('../Bricks/Function.js');
include('../Bricks/DOM.js');
include('../Bricks/index.js');
include('../Bricks/Event.js');
//#endif

/**
 * @class Popups.Empty
 * @extends Bricks.Widget
 *
 * Попап с без содержимого. Умеет показываться рядом с нужным элементом. Имеет носик для индикации того
 * элемента, рядом с которым показывается.
 */
Popups.Empty = Bricks.Widget.inherit({
    /**
     * @event beforeshow
     * Посылается перед показом попапа. Если остановить обработку события, то попап показан не будет.
     */

    /**
     * @event show
     * Посылается после показа попапа.
     */

    /**
     * @event beforehide
     * Посылается перед скрытием попапа. Если остановить обработку события, то попап не скроется.
     */

    /**
     * @event hide
     * Посылается после скрытия попапа.
     */


    /**
     * @type String
     * Шаблон содержимого попапа. Вызывается в контексте текущего экземпляра.
     */
    content: '',

    /**
     * @type Boolean
     * Скрывать ли попап при клике вне его.
     */
    hideByClick: true,

    /**
     * @type Boolean
     * Уничтожать ли попап после скрытии.
     */
    destroyOnHide: false,

    /**
     * @type Number
     * Если больше нуля, то после показа попапа он скроется через данное число миллисекунд.
     */
    autoHide: 0,


    className: 'popups-empty',

    css: {
        '.popups-empty': {
            'position': 'absolute',
            'left': '-9999px',
            'top': '-9999px',
            'z-index': '100',

            'box-shadow': '0 1px 7px #9a9a9a',
            'opacity': '0',

            'border': '1px solid #dedede',
            'border-color': 'rgba(154, 154, 154, 0.5)',
            'border-top-color': 'rgba(154, 154, 154, 0.4)',
            'border-bottom-color': 'rgba(154, 154, 154, 0.6)',

            '^ box-shadow': {
                'border': '1px solid #BFBFBF'
            }
        },

        '.popups-empty__content': {
            'background': '#FFF'
        },

        '.popups-empty__tail': {
            'font': '0/0 a',

            'position': 'absolute',

            'display': 'none',

            'border-width': '7px'
        },
        '.popups-empty__tail-i': {
            'position': 'absolute',

            'border-width': '6px'
        },

        '.popups-empty_tail-top': {
            '.popups-empty__tail': {
                'display': 'block',

                'margin-top': '-7px',

                'border-color': '#d2d2d2 transparent',
                'border-style': 'none solid solid'
            },
            '.popups-empty__tail-i': {
                'margin': '1px 0 0 -6px',

                'border-color': '#FFFFFF transparent',
                'border-style': 'none solid solid'
            }
        },

        '.popups-empty_tail-right': {
            '.popups-empty__tail': {
                'display': 'block',

                'left': '100%',

                'border-color': 'transparent #c9c9c5',
                'border-style': 'solid none solid solid'
            },
            '.popups-empty__tail-i': {
                'margin': '-6px 0 0 -7px',

                'border-color': 'transparent #FFFFFF',
                'border-style': 'solid none solid solid'
            }
        },

        '.popups-empty_tail-bottom': {
            '.popups-empty__tail': {
                'display': 'block',

                'top': '100%',

                'border-color': '#d2d2d2 transparent',
                'border-style': 'solid solid none'
            },
            '.popups-empty__tail-i': {
                'margin': '-7px 0 0 -6px',

                'border-color': '#FFFFFF transparent',
                'border-style': 'solid solid none'
            }
        },

        '.popups-empty_tail-left': {
            '.popups-empty__tail': {
                'display': 'block',

                'margin-left': '-7px',

                'border-color': 'transparent #c9c9c5',
                'border-style': 'solid solid solid none'
            },
            '.popups-empty__tail-i': {
                'margin': '-6px 0 0 1px',

                'border-color': 'transparent #FFFFFF',
                'border-style': 'solid solid solid none'
            }
        }
    },

    html:   '<div class="popups-empty__tail">' +
                '<div class="popups-empty__tail-i"></div>' +
            '</div>' +
            '<div class="popups-empty__content"><%&= this._applyTemplate(this.content) %></div>',

    _initComponent: function() {
        Popups.Empty.superclass._initComponent.apply(this, arguments);
        if (!this.renderTo) {
            this.doc.body.insertBefore(this._getEl(), this.doc.body.firstChild);
        }

        this._opacity = 0;
        this._visible = false;
        this._targets = [];
        this._orientations = [];

        this._on(this.doc, 'click', this.Popups_Empty__onDocumentClick);
    },

    destroy: function() {
        this._un(this.doc, 'click', this.Popups_Empty__onDocumentClick);
        Popups.Empty.superclass.destroy.apply(this, arguments);
    },

    /**
     * Возвращает ссылку на DOM-элемент, содержащий контент попапа.
     *
     * @return {Node}
     */
    getContentEl: function() {
        return this._getEl('popups-empty__content');
    },

    /**
     * Показывает попап на странице в координатах pos.
     *
     * @param {Array} pos Координаты [left, top].
     */
    showAt: function(pos) {
        if (this._fireEvent('beforeshow')) {
            clearTimeout(this.Popups_Empty__hideTID);
            if (!this._visible) {
                // Здесь мы фиксируем ширину попапа, иначе на краях экрана контент съезжает.
                this._setStyle({
                    'width': 'auto'
                });
                this._setStyle({
                    'width': this._getEl('popups-empty__content').offsetWidth + 'px'
                });
            }
            this._visible = true;
            this._setStyle({
                'left': pos[0] + 'px',
                'top': pos[1] + 'px'
            });
            this.Popups_Empty__changeOpacity(0.4, function() {
                this._fireEvent('show');
                if (this.autoHide > 0) {
                    this.Popups_Empty__hideTID = Bricks.Function.defer(this.hide, this.autoHide, this);
                }
            }, this);
        }
    },

    /**
     * Скрывает попап.
     */
    hide: function() {
        if (this._fireEvent('beforehide')) {
            this._visible = false;
            this._visibledBy = null;
            this.Popups_Empty__changeOpacity(-0.4, function() {
                this._setStyle({
                    'left': '',
                    'top': '',
                    'width': 'auto'
                });
                this._fireEvent('hide');
                if (this.destroyOnHide) {
                    this.destroy();
                }
            }, this);
        }
    },

    /**
     * Показывает попап с носиком рядом с элементом el.
     *
     * @param {Node/String} el Элемент или id элемента, рядом с которым показать попап.
     * @param {Array/String} [orientations] Строка 'top', 'right', 'bottom', 'left' или массив таких строк. Указывает
     *      с какой стороны от элемента показывать попап. Если передан массив, то выбирается первое оптимальное
     *      значение. По умолчанию: ['right', 'left', 'bottom', 'top'].
     */
    showBy: function(el, orientations) {
        el = Bricks.DOM.getEl(el);
        orientations = orientations || ['right', 'left', 'bottom', 'top'];
        if (!Bricks.isArray(orientations)) {
            orientations = [orientations];
        }

        this._visibledBy = el;
        ['popups-empty_tail-top', 'popups-empty_tail-right', 'popups-empty_tail-bottom', 'popups-empty_tail-left'].forEach(function(className) {
            this._removeClassName(className);
        }, this);
        this._setStyle('popups-empty__tail', {
            'margin-left': '',
            'margin-top': ''
        });

        var elPos = Bricks.DOM.getPos(el);
        var elSize = Bricks.DOM.getSize(el);
        var elCenter = [
            Math.round(elPos[0] + elSize[0] / 2),
            Math.round(elPos[1] + elSize[1] / 2)
        ];
        var scrollPos = Bricks.DOM.getDocumentScroll(this.doc);
        var viewportSize = Bricks.DOM.getViewportSize(this.doc);
        var documentSize = Bricks.DOM.getDocumentSize(this.doc);
        var popupSize = this._getElSize();

        var bestOrientation = null;
        var bestWeight = -1;
        for (var i = 0; i < orientations.length; i++) {
            var weight = {
                top: this._getTopOrientationWeight,
                right: this._getRightOrientationWeight,
                bottom: this._getBottomOrientationWeight,
                left: this._getLeftOrientationWeight
            }[orientations[i]].call(this, elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize);
            if (weight > bestWeight) {
                bestOrientation = orientations[i];
                bestWeight = weight;
                if (bestWeight == 3) {
                    break;
                }
            }
        }

        ({
            top: this._showByTop,
            right: this._showByRight,
            bottom: this._showByBottom,
            left: this._showByLeft
        })[bestOrientation].call(this, elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize);

        this.Popups_Empty__onClickDisabled = true;
        Bricks.Function.defer(function() {
            this.Popups_Empty__onClickDisabled = false;
        }, 10, this);
    },

    /**
     * Показывает попап рядом с точкой point, выше или ниже.
     *
     * @param {Array} point Точка, рядом с которой показать попап.
     */
    showAbout: function(point) {
        var pos = [
            point[0],
            point[1] + 20
        ];
        var viewport = Bricks.DOM.getViewportSize(this.doc);
        var scroll = Bricks.DOM.getDocumentScroll(this.doc);
        var size = this._getElSize();
        if (pos[0] + size[0] > scroll[0] + viewport[0]) {
            pos[0] = Math.max(scroll[0], scroll[0] + viewport[0] - size[0] - 5);
        }
        if (pos[1] + size[1] > scroll[1] + viewport[1]) {
            pos[1] = Math.max(scroll[1], point[1] - size[1] - 20);
        }
        this.showAt(pos);
    },

    /**
     * Приклепляет попап к элементу, после чего при клике по этому элементу попап или покажется, или скроется, если
     * он в момент клика видимый.
     *
     * @param {Node/String} el Элемент или id элемента.
     * @param {String/Array} [orientation] С какой стороны показывать попап. Передаётся как есть в {@link #showBy}.
     */
    bind: function(el, orientation) {
        el = Bricks.DOM.getEl(el);
        this._targets.push(el);
        this._orientations.push(orientation);
    },

    /**
     * Открепляет попап от элемента.
     *
     * @param {Node/String} el Элемент или id элемента.
     */
    unbind: function(el) {
        el = Bricks.DOM.getEl(el);
        var index = this._targets.indexOf(el);
        if (index > -1) {
            this._targets.splice(index, 1);
            this._orientations.splice(index, 1);
        }
    },

    /**
     * Возвращает true, если попап в данный момент видимый.
     *
     * @return {Boolean}
     */
    isVisible: function() {
        return this._visible;
    },

    /**
     * Возвращает элемент, рядом с которым показан в данный момент попап. Если попап скрыт или показан без привязки к
     * элементу, вернёт null.
     *
     * @return {Node}
     */
    getVisibledBy: function() {
        return this._visibledBy;
    },


    _showByTop: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        var popupPos = [
            Math.round(elCenter[0] - popupSize[0] / 2),
            elPos[1] - 7 - popupSize[1]
        ];
        this._fitTo(0, scrollPos, viewportSize, documentSize, popupSize, popupPos);
        this._addClassName('popups-empty_tail-bottom');
        this._setStyle('popups-empty__tail', {
            'margin-left': Math.max(0, Math.min(popupSize[0] - 15, elCenter[0] - popupPos[0] - 7)) + 'px'
        });
        this.showAt(popupPos);
    },

    _showByRight: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        var popupPos = [
            elPos[0] + elSize[0] + 7,
            elCenter[1] - 20
        ];
        this._fitTo(1, scrollPos, viewportSize, documentSize, popupSize, popupPos);
        this._addClassName('popups-empty_tail-left');
        this._setStyle('popups-empty__tail', {
            'margin-top': Math.max(0, Math.min(popupSize[1] - 15, elCenter[1] - popupPos[1] - 7)) + 'px'
        });
        this.showAt(popupPos);
    },

    _showByBottom: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        var popupPos = [
            Math.round(elCenter[0] - popupSize[0] / 2),
            elPos[1] + elSize[1] + 7
        ];
        this._fitTo(0, scrollPos, viewportSize, documentSize, popupSize, popupPos);
        this._addClassName('popups-empty_tail-top');
        this._setStyle('popups-empty__tail', {
            'margin-left': Math.max(0, Math.min(popupSize[0] - 15, elCenter[0] - popupPos[0] - 7)) + 'px'
        });
        this.showAt(popupPos);
    },

    _showByLeft: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        var popupPos = [
            elPos[0] - popupSize[0] - 7,
            elCenter[1] - 20
        ];
        this._fitTo(1, scrollPos, viewportSize, documentSize, popupSize, popupPos);
        this._addClassName('popups-empty_tail-right');
        this._setStyle('popups-empty__tail', {
            'margin-top': Math.max(0, Math.min(popupSize[1] - 15, elCenter[1] - popupPos[1] - 7)) + 'px'
        });
        this.showAt(popupPos);
    },

    _fitTo: function(dim, scrollPos, viewportSize, documentSize, popupSize, popupPos) {
        if (popupSize[dim] < viewportSize[dim]) {
            popupPos[dim] = Math.max(scrollPos[dim], Math.min(scrollPos[dim] + viewportSize[dim] - popupSize[dim], popupPos[dim]));
        } else if (popupSize[dim] < documentSize[dim]) {
            popupPos[dim] = Math.max(0, Math.min(documentSize[dim] - popupSize[dim], popupPos[dim]));
        } else {
            popupPos[dim] = Math.max(0, popupPos[dim]);
        }
    },

    _getTopOrientationWeight: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        // Влезает во вьюпорт
        if (elCenter[0] > scrollPos[0] + 20 && elCenter[0] < scrollPos[0] + viewportSize[0] - 20) {
            if (elPos[1] - scrollPos[1] - 7 > popupSize[1]) {
                if (popupSize[0] < viewportSize[0]) {
                    return 3;
                }
            }
        }
        // Влезает в документ
        if (elCenter[0] > 20 && elCenter[0] < documentSize[0] - 20) {
            if (elPos[1] - 7 > popupSize[1]) {
                if (popupSize[0] < documentSize[0]) {
                    return 2;
                }
            }
        }
        // Не вылезает за 0,0 документа
        if (elCenter[0] > 20) {
            if (elPos[1] - 7 > popupSize[1]) {
                return 1;
            }
        }
        return 0;
    },

    _getRightOrientationWeight: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        // Влезает во вьюпорт
        if (elCenter[1] > scrollPos[1] + 20 && elCenter[1] < scrollPos[1] + viewportSize[1] - 20) {
            if (scrollPos[0] + viewportSize[0] - elPos[0] - elSize[0] - 7 > popupSize[0]) {
                if (popupSize[1] < viewportSize[1]) {
                    return 3;
                }
            }
        }
        // Влезает в документ
        if (elCenter[1] > 20 && elCenter[1] < documentSize[1] - 20) {
            if (documentSize[0] - elSize[0] - elPos[0] - 7 > popupSize[0]) {
                if (popupSize[1] < documentSize[1]) {
                    return 2;
                }
            }
        }
        // Не вылезает за 0,0 документа
        if (elCenter[1] > 20) {
            return 1;
        }
        return 0;
    },

    _getBottomOrientationWeight: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        // Влезает во вьюпорт
        if (elCenter[0] > scrollPos[0] + 20 && elCenter[0] < scrollPos[0] + viewportSize[0] - 20) {
            if (scrollPos[1] + viewportSize[1] - elPos[1] - elSize[1] - 7 > popupSize[1]) {
                if (popupSize[0] < viewportSize[0]) {
                    return 3;
                }
            }
        }
        // Влезает в документ
        if (elCenter[0] > 20 && elCenter[0] < documentSize[0] - 20) {
            if (documentSize[1] - elPos[1] - elSize[1] - 7 > popupSize[1]) {
                if (popupSize[0] < documentSize[0]) {
                    return 2;
                }
            }
        }
        // Не вылезает за 0,0 документа
        if (elCenter[0] > 20) {
            return 1;
        }
        return 0;
    },

    _getLeftOrientationWeight: function(elPos, elSize, elCenter, scrollPos, viewportSize, documentSize, popupSize) {
        // Влезает во вьюпорт
        if (elCenter[1] > scrollPos[1] + 20 && elCenter[1] < scrollPos[1] + viewportSize[1] - 20) {
            if (elPos[0] - scrollPos[0] - 7 > popupSize[0]) {
                if (popupSize[1] < viewportSize[1]) {
                    return 3;
                }
            }
        }
        // Влезает в документ
        if (elCenter[1] > 20 && elCenter[1] < documentSize[1] - 20) {
            if (elPos[0] - 7 > popupSize[0]) {
                if (popupSize[1] < documentSize[1]) {
                    return 2;
                }
            }
        }
        // Не вылезает за 0,0 документа
        if (elCenter[1] > 20) {
            if (elPos[0] - 7 > popupSize[0]) {
                return 1;
            }
        }
        return 0;
    },

    Popups_Empty__onDocumentClick: function(evt) {
        if (this.Popups_Empty__onClickDisabled) {
            return;
        }
        var target = Bricks.Event.getTarget(evt);
        while (target) {
            if (target == this._visibledBy) {
                this.hide();
                return;
            } else {
                var index = this._targets.indexOf(target);
                if (index > -1) {
                    this.showBy(target, this._orientations[index]);
                    return;
                }
            }
            target = target.parentNode;
        }
        if (this.hideByClick && Bricks.Event.getTarget(evt, '.popups-empty') != this._getEl()) {
            this.hide();
        }
    },

    Popups_Empty__changeOpacity: function(delta, callback, ctx) {
        clearTimeout(this.Popups_Empty__opacityTimeout);
        (function() {
            if ((delta > 0 && this._opacity < 1) || (delta < 0 && this._opacity > 0)) {
                this._opacity = Math.max(0, Math.min(1, this._opacity + delta));
                this._setStyle({
                    'opacity': this._opacity
                });
                this.Popups_Empty__opacityTimeout = Bricks.Function.defer(arguments.callee, 20, this);
            } else {
                callback.call(ctx);
            }
        }).call(this);
    }
});