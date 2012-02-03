//#include index.js::base
//#include String.js::base
//#include Event.js::base

//noinspection JSUnusedGlobalSymbols
Bricks.DOM = {
    //#label getEl
    /**
     * Возвращает DOM-элемент по его id, или переданный параметр.
     *
     * @param {String/Node} el Если строка, то возвращается элемент с таким id, иначе переданный аргумент.
     * @param {Document} [doc] Документ, в котором осуществлять поиск. По умолчанию текущий.
     *
     * @return {Node}
     */
    getEl: function(el, doc) {
        doc = doc || document;
        return typeof el == 'string' ? doc.getElementById(el) : el;
    },
    //#endlabel getEl

    //#label getEls
    //#include index.js::isArray
    //#include ::getEl::createSelectorFilter
    /**
     * Ищет элементы по простому селектору внутри нужных родителей.
     *
     * @param {String} [selector] Строка вида 'tagName.className'. Оба значения опциональны. Можно в начале селектора
     *      добавить !, тогда вернётся первый найденный элемент без поиска последующих.
     * @param {Node/Array} [parents] Элемент или массив элементов, внутри которых искать соответствующие селектору
     *      элементы. Если не указан, ищется внутри всего документа.
     *
     * @return {Node/Array} Массив элементов или один элемент, если в селекторе указан !.
     */
    getEls: function(selector, parents) {
        if (!parents) {
            parents = [document];
        }
        if (!Bricks.isArray(parents)) {
            parents = [parents];
        }
        if (selector.charAt(0) == '!') {
            var once = true;
            selector = selector.substr(1);
        }
        var filter = Bricks.DOM.createSelectorFilter(selector);
        var result = [];
        for (var i = 0; i < parents.length; i++) {
            var elements = Bricks.DOM.getEl(parents[i]).getElementsByTagName(selector.split('.')[0] || '*');
            for (var j = 0; j < elements.length; j++) {
                if (filter(elements[j])) {
                    if (once) {
                        return elements[j];
                    }
                    result.push(elements[j]);
                }
            }
        }
        return once ? null : result;
    },
    //#endlabel getEls

    //#label createSelectorFilter
    //#include String.js::trim
    /**
     * Возвращает функцию, проверяющую переданный ей элемент на соответствие селектору.
     *
     * @see Bricks.DOM.getEls
     * @see Bricks.EventObject.getTarget
     *
     * @param {String} selector Селектор вида tagName.className
     *
     * @return {Function}
     */
    createSelectorFilter: function(selector) {
        this.Bricks_DOM__selectors = this.Bricks_DOM__selectors || {};
        selector = Bricks.String.trim(selector);
        if (!this.Bricks_DOM__selectors[selector]) {
            var selectorParts = selector.split('.');
            var tagName = selectorParts[0].toUpperCase(), className = selectorParts[1], conditions = [];
            if (tagName && tagName != '*') {
                conditions.push('e.tagName=="' + tagName.replace(/"/g, '\\u0022') + '"');
            }
            if (className) {
                conditions.push('e.className && e.className.match && e.className.match(/(^|\\s)' + className + '(\\s|$)/)');
            }
            this.Bricks_DOM__selectors[selector] = new Function('e', 'return ' + (conditions.join('&&') || 'true'));
        }
        return this.Bricks_DOM__selectors[selector];
    },
    //#endlabel createSelectorFilter

    //#label remove
    //#include ::getEl
    /**
     * Удаляет элемент из DOM-дерева.
     *
     * @param {Node/String} el Удаляемый элемент или его id.
     */
    remove: function(el) {
        el = Bricks.DOM.getEl(el);
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    },
    //#endlabel remove

    //#label setStyle
    //#include ::getEl::normalizeCSSProperty
    /**
     * Устанавливает элементу el стили style. Стили передаются в виде объекта. Имена стилей, состоящие из нескольких
     * слов, пишутся в кавычках ('font-size': '12px', 'border-bottom': '1px solid red', ...). Но лучше все имена
     * писать в кавычках для единообразия.
     *
     * @param {Node/String} el Элемент, которому устанавливаются стили, или его id.
     * @param {Object} style Хэш со стилями.
     */
    setStyle: function(el, style) {
        el = Bricks.DOM.getEl(el);
        for (var name in style) {
            if (style.hasOwnProperty(name)) {
                var propValue = Bricks.DOM.normalizeCSSProperty(name, style[name]);
                el.style[propValue[0]] = propValue[1];
            }
        }
    },
    //#endlabel setStyle

    //#label getPos
    //#include ::getEl::getDocumentScroll::getRootElement
    /**
     * Возвращает позицию элемента относительно окна браузера.
     *
     * @param {Node/String} el Элемент или его id.
     *
     * @return {Array} Массив целых чисел вида [left, top].
     */
    getPos: function(el) {
        el = Bricks.DOM.getEl(el);
        if (el.getBoundingClientRect) {
            var box = el.getBoundingClientRect();
            var doc = el.ownerDocument;
            var scroll = Bricks.DOM.getDocumentScroll(doc);
            var rootEl = Bricks.DOM.getRootElement(doc);
            return [
                box.left + scroll[0] - (rootEl.clientLeft || 0),
                box.top  + scroll[1] - (rootEl.clientTop || 0)
            ];
        } else {
            var left = 0;
            var top = 0;
            while (el) {
                left += parseInt(el.offsetLeft);
                top  += parseInt(el.offsetTop);
                el = el.offsetParent;
            }
            return [left, top];
        }
    },
    //#endlabel getPos

    //#label getSize
    //#include ::getEl
    /**
     * Возвращает размеры элемента.
     *
     * @param {String/Node} el Элемент или его id.
     *
     * @return {Array} Массив из двух элементов [width, height]
     */
    getSize: function(el) {
        el = Bricks.DOM.getEl(el);
        return [el.offsetWidth, el.offsetHeight];
    },
    //#endlabel getSize

    //#label classNameExists
    //#include String.js::trim
    //#include ::getEl
    /**
     * Возвращает true, если CSS-класс className установлен у элемента el.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} className Имя проверяемого класса.
     *
     * @return {Boolean}
     */
    classNameExists: function(el, className) {
        return new RegExp('(^|\\s)' + Bricks.String.trim(className) + '(\\s|$)', '').test(Bricks.DOM.getEl(el).className);
    },
    //#endlabel classNameExists

    //#label addClassName
    //#include ::getEl::classNameExists
    /**
     * Добавляет CSS-класс элементу, если у элемента нет такого класса.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} className Имя добавляемого класса.
     *
     * @return {Boolean} true, если класса не было и он добавился, иначе false.
     */
    addClassName: function(el, className) {
        if (!Bricks.DOM.classNameExists(el, className)) {
            Bricks.DOM.getEl(el).className += ' ' + className;
            return true;
        }
        return false;
    },
    //#endlabel addClassName

    //#label removeClassName
    //#include ::getEl
    /**
     * Удаляет CSS-класс у элемента, если у элемента есть такой класс.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} className Имя удаляемого класса.
     *
     * @return {Boolean} true, если класс был и он удалился, иначе false.
     */
    removeClassName: function(el, className) {
        el = Bricks.DOM.getEl(el);
        var newClassName = el.className.replace(new RegExp('(^|\\s)' + className + '(?=\\s|$)', 'g'), ' ');
        if (newClassName != el.className) {
            el.className = newClassName;
            return true;
        }
        return false;
    },
    //#endlabel removeClassName

    //#label toggleClassName
    //#include ::classNameExists::addClassName::removeClassName
    /**
     * Добавляет/удаляет CSS-класс className у элемента el в зависимости от параметра adding. Если adding не указан,
     * то класс удаляется, если он есть, и добавляется, если его нет.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} className Имя CSS-класса.
     * @param {Boolean} [adding] Добавить или удалить класс.
     *
     * @return {Boolean} true, если переключилось наличие класса, иначе false.
     */
    toggleClassName: function(el, className, adding) {
        if (arguments.length < 3) {
            adding = !Bricks.DOM.classNameExists(el, className);
        }
        return adding ? Bricks.DOM.addClassName(el, className) : Bricks.DOM.removeClassName(el, className);
    },
    //#endlabel toggleClassName

    //#label getParent
    //#include ::getEl::createSelectorFilter
    /**
     * Возращает родителя элемента. Если указан selector, то производит поиск вверх по цепочке родителей, пока
     * не будет найден элемент, удовлетворяющий условию. Селектор может иметь вид tagName.className.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} [selector] Строка формата, соответствующего формату аргумента {@link Bricks.DOM.createSelectorFilter}.
     * @param {Number} [depth] Глубина просмотра дерева, если указан selector.
     * @param {Boolean} [includeSelf] Если true, то на соответствие селектору проверяется и сам элемент.
     *
     * @return {Node} Найденный родитель или null.
     */
    getParent: function(el, selector, depth, includeSelf) {
        if (!depth || depth <= 0) {
            depth = 1000;
        }
        var parent = Bricks.DOM.getEl(el);
        if (!includeSelf) {
            parent = parent.parentNode;
        }
        if (!selector) {
            return parent;
        }
        var filter = Bricks.DOM.createSelectorFilter(selector);
        var d = 0;
        do {
            if (filter(parent)) {
                return parent;
            }
        } while ((parent = parent.parentNode) && (++d < depth));
        return null;
    },
    //#endlabel getParent

    //#label on
    //#include ::getEl
    //#include index.js::mixin
    //#include String.js::trim
    /**
     * Навешивает на элементе el обработчик fn на события events, перечисленные через запятую. Обработчик
     * вызывается в контексте ctx и ему передаётся объект события во всех браузерах, включая IE.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} events Имена событий через запятую.
     * @param {Function} fn Обработчик события.
     * @param {Object} [ctx] Контекст вызова обработчика.
     */
    on: function(el, events, fn, ctx) {
        el = Bricks.DOM.getEl(el);
        this.Bricks_DOM__listeners = this.Bricks_DOM__listeners || {};
        var listeners = this.Bricks_DOM__listeners;
        var names = events.split(',');
        for (var i = 0; i < names.length; i++) {
            var name = Bricks.String.trim(names[i]);
            listeners[name] = listeners[name] || [];
            var handler = function(evt) {
                fn.call(ctx, evt || window.event);
            };
            listeners[name].push([el, fn, ctx, handler]);
            if (el.addEventListener) {
                el.addEventListener(name, handler, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, handler);
            }
        }
    },
    //#endlabel on

    //#label un
    //#include ::getEl
    //#include String.js::trim
    /**
     * Снимает с элемента el обработчик fn с событий events, перчисленных через запятую. Обработчик должен быть
     * установлен функцией {@link Bricks.DOM.on}.
     *
     * @param {Node/String} el Элемент или его id.
     * @param {String} events Имена событий через запятую.
     * @param {Function} fn Обработчик события.
     * @param {Object} [ctx] Контекст вызова обработчика.
     */
    un: function(el, events, fn, ctx) {
        el = Bricks.DOM.getEl(el);
        if (this.Bricks_DOM__listeners) {
            var names = events.split(',');
            for (var i = 0; i < names.length; i++) {
                var name = Bricks.String.trim(names[i]);
                var listeners = this.Bricks_DOM__listeners[name] || [];
                for (var j = 0; j < listeners.length; j++) {
                    var listener = listeners[j];
                    if (listener[0] == el && listener[1] == fn && listener[2] == ctx) {
                        listeners.splice(j, 1);
                        if (el.removeEventListener) {
                            el.removeEventListener(event, listener[3], false);
                        } else if (el.detachEvent) {
                            el.detachEvent('on' + event, listener[3]);
                        }
                        return;
                    }
                }
            }
        }
    },
    //#endlabel un

    //#label initDrag
    //#include ::getEl::on::un
    //#include Event.js::getPos
    /**
     * Инициализирует возможность перетаскивания элемента. Метод предназначен лишь для автоматизации навешивания
     * обработчиков событий. Вся логика перетаскивания, ресайза или ещё чего реализуется в вызывающем коде.
     *
     * Функция onStart вызывается в момент начала перетаскивания (т.е. при событии mousedown). В ней можно
     * произвести необходимую инициализацию. Если onStart вернёт false, то перетаскивание производиться не будет.
     * Функция onMove вызывается при передвижении курсора мыши с зажатой левой кнопкой.
     * Функция onEnd вызывается при отпускании левой кнопки мыши.
     * Функциям onStart и onEnd единственным аргументом передаётся объект события. Функции onMove первым аргументом
     * передаётся массив из двух чисел, обозначающих разницу с предыдущей позицией курсора, второй аргумент --
     * объект события.
     *
     * @param {Element} el DOM-элемент или его id, mousedown на котором будет инициализировать перетаскивание.
     * @param {Function} onStart Обработчик начала перетаскивания.
     * @param {Function} onMove Обработчик процесса перетаскивания.
     * @param {Function} [onEnd] Обработчик окончания перетаскивания.
     * @param {Object} [ctx] Контекст вызова обработчиков.
     */
    initDrag: function(el, onStart, onMove, onEnd, ctx) {
        var doc = Bricks.DOM.getEl(el).ownerDocument;
        var lastPos;

        Bricks.DOM.on(el, 'mousedown', function(evt) {
            lastPos = Bricks.Event.getPos(evt);
            if (!onStart || onStart.call(ctx, evt) !== false) {
                Bricks.DOM.on(doc, 'mousemove', onMouseMove);
                Bricks.DOM.on(doc, 'mouseup', onMouseUp);
                Bricks.Event.stop(evt);
            }
        });

        function onMouseMove(evt) {
            var curPos = Bricks.Event.getPos(evt);
            var delta = [curPos[0] - lastPos[0], curPos[1] - lastPos[1]];
            lastPos = curPos;
            if (onMove) {
                onMove.call(ctx, delta, evt);
            }
        }

        function onMouseUp(evt) {
            if (onEnd) {
                onEnd.call(ctx, evt);
            }
            Bricks.DOM.un(doc, 'mousemove', onMouseMove);
            Bricks.DOM.un(doc, 'mouseup', onMouseUp);
        }
    },
    //#endlabel initDrag

    //#label getWindow
    /**
     * Возвращает объект окна, в котором содержится переданный документ.
     *
     * @param {Document} [doc] Необязательный. По-умолчанию текущий документ.
     *
     * @return {window}
     */
    getWindow: function(doc) {
        doc = doc || document;
        return doc.parentWindow || doc.defaultView;
    },
    //#endlabel getWindow

    //#label getRootElement
    /**
     * Возвращает корневой элемент на странице. Если compatMode=='CSS1Compat', то это documentElement, иначе body.
     * Если compatMode не определен, то можно считать, что это 'BackCompat'.
     *
     * @param {Document} [doc] Передается в случае работы с другим документом.
     *
     * @return {Node} documentElement или body
     */
    getRootElement: function(doc) {
        doc = doc || document;
        return doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
    },
    //#endlabel getRootElement

    //#label getDocumentScroll
    //#include ::getWindow
    /**
     * Возвращает позицию скрола документа.
     *
     * @param {Document} [doc] Передается в случае работы с другим документом.
     *
     * @return {Array} Массив из двух элементов [left, top].
     */
    getDocumentScroll: function(doc) {
        doc = doc || document;
        var win = Bricks.DOM.getWindow(doc);
        return [
            win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0,
            win.pageYOffset || doc.documentElement.scrollTop  || doc.body.scrollTop  || 0
        ];
    },
    //#endlabel getDocumentScroll

    //#label getDocumentSize
    //#include ::getViewportSize::getRootElement
    /**
     * Возвращает размеры всего документа.
     *
     * @param {Document} [doc] Передается в случае работы с другим документом.
     *
     * @return {Array} Массив из двух элементов [width, height].
     */
    getDocumentSize: function(doc) {
        doc = doc || document;
        var viewport = Bricks.DOM.getViewportSize(doc), elem = Bricks.DOM.getRootElement(doc);
        return [Math.max(elem.scrollWidth, viewport[0]), Math.max(elem.scrollHeight, viewport[1])];
    },
    //#endlabel getDocumentSize

    //#label getViewportSize
    //#include ::getRootElement
    /**
     * Возвращает размеры видимой части документа.
     *
     * @param {Document} [doc] Передается в случае работы с другим документом.
     *
     * @return {Array} Массив из двух элементов [width, height].
     */
    getViewportSize: function(doc) {
        doc = doc || document;
        var elem = Bricks.DOM.getRootElement(doc);
        return [elem.clientWidth, elem.clientHeight];
    },
    //#endlabel getViewportSize

    //#label normalizeCSSProperty
    //#include String.js::camelize
    /**
     * Возвращает имя и значение CSS свойства, актуальное для текущего браузера. Свойство opacity, например, для IE
     * преобразует в filter:Alpha(...).
     *
     * @param {String} name Имя свойства.
     * @param {String} value Значение свойства.
     * @param {Node} [el] DOM-элемент, которому будет присваиваться свойство. Актуально только для свойства float,
     *      т.к. в свойстве style оно имеет имя cssFloat/styleFloat.
     *
     * @return {Array} Массив с двумя элементами: имя и значение.
     */
    normalizeCSSProperty: function(name, value, el) {
        var etalon = el ? el.style : document.documentElement.style;
        name = Bricks.String.camelize(name);

        if (name == 'opacity' && typeof etalon['opacity'] != 'string') {
            return ['filter', value == 1 ? '' : 'Alpha(opacity=' + (value * 100) + ')'];
        }

        if (name == 'float') {
            if (el) {
                name = typeof etalon['cssFloat'] == 'string' ? 'cssFloat' : 'styleFloat';
            }
            return [name, value];
        }

        if (typeof etalon[name] != 'string') {
            var prefixes = ['Moz', 'Webkit', 'O', 'Opera'];
            var camelName = Bricks.String.camelize('-' + name);
            for (var i = 0; i < prefixes.length; i++) {
                if (typeof etalon[prefixes[i] + camelName] == 'string') {
                    return [prefixes[i] + camelName, value];
                }
            }
        }

        return [name, value];
    },
    //#endlabel normalizeCSSProperty

    //#label createFragment
    /**
     * Создаёт из строки str DocumentFragment для последующего добавления его в DOM-дерево.
     *
     * @param {String} str
     * @param {Document} [doc] Документ, в контексте которого создаётся фрагмент. По умолчанию текущий документ.
     *
     * @return {DocumentFragment}
     */
    createFragment: function(str, doc) {
        doc = doc || document;
        var fragment = doc.createDocumentFragment();
        if (str.length) {
            var div = doc.createElement('div');
            div.innerHTML = str;
            while (div.firstChild) {
                fragment.appendChild(div.firstChild);
            }
        }
        return fragment;
    },
    //#endlabel createFragment

    '': ''
};

//#label fixBackground
// Фикс бага IE6, из-за которого не кэшируются фоновые изображения.
try { document.execCommand("BackgroundImageCache", false, true); } catch (ignore) {}
//#endlabel fixBackground
