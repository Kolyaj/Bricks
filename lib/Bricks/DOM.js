Bricks.DOM = {};

/**
 * Возвращает DOM-элемент по его id, или переданный параметр.
 *
 * @param {String/Node} el Если строка, то возвращается элемент с таким id, иначе переданный аргумент.
 * @param {Document} [doc] Документ, в котором осуществлять поиск. По умолчанию текущий.
 *
 * @return {Node}
 */
Bricks.DOM.getEl = function(el, doc) {
    doc = doc || document;
    return el ? typeof el == 'string' ? doc.getElementById(el) : el : null;
};

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
Bricks.DOM.getEls = function(selector, parents) {
    if (!parents) {
        parents = [document];
    }
    if (!Bricks.isArray(parents)) {
        parents = [parents];
    }
    if (selector.charAt(0) === '!') {
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
};

/**
 * Возвращает функцию, проверяющую переданный ей элемент на соответствие селектору.
 *
 * @see Bricks.DOM.getEls
 * @see Bricks.Event.getTarget
 *
 * @param {String} selector Селектор вида tagName.className
 *
 * @return {Function}
 */
Bricks.DOM.createSelectorFilter = function(selector) {
    this.Bricks_DOM__selectors = this.Bricks_DOM__selectors || {};
    selector = Bricks.String.trim(selector);
    if (!this.Bricks_DOM__selectors[selector]) {
        var selectorParts = selector.split('.');
        var tagName = selectorParts[0].toUpperCase();
        var className = selectorParts[1];
        var conditions = [];
        if (tagName && tagName !== '*') {
            conditions.push('e.tagName=="' + tagName.replace(/"/g, '\\u0022') + '"');
        }
        if (className) {
            conditions.push('e.className && e.className.match && e.className.match(/(^|\\s)' + className + '(\\s|$)/)');
        }
        this.Bricks_DOM__selectors[selector] = new Function('e', 'return ' + (conditions.join('&&') || 'true'));
    }
    return this.Bricks_DOM__selectors[selector];
};

/**
 * Удаляет элемент из DOM-дерева.
 *
 * @param {Node/String} el Удаляемый элемент или его id.
 */
Bricks.DOM.remove = function(el) {
    el = Bricks.DOM.getEl(el);
    if (el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

/**
 * Устанавливает элементу el стили style. Стили передаются в виде объекта. Имена стилей, состоящие из нескольких
 * слов, пишутся в кавычках ('font-size': '12px', 'border-bottom': '1px solid red', ...). Но лучше все имена
 * писать в кавычках для единообразия.
 *
 * @param {Node/String} el Элемент, которому устанавливаются стили, или его id.
 * @param {Object} style Хэш со стилями.
 */
Bricks.DOM.setStyle = function(el, style) {
    for (var name in style) {
        if (style.hasOwnProperty(name)) {
            Bricks.DOM.setStyleProperty(el, name, style[name]);
        }
    }
};

/**
 * Устанавливает элементу el стиль name со значением value. Имена свойств используются такие же, как и в CSS, то есть margin-left, float, ... Свойство и значение нормализуются функцией {@link Bricks.DOM.normalizeCSSProperty}. Если значение свойства передано числом, то ему допишется px. Можно передать несколько свойств и значений: свойства в строке через запятую, а значения массивом.
 * @param {Node/String} el
 * @param {String} name
 * @param {*} value
 */
Bricks.DOM.setStyleProperty = function(el, name, value) {
    el = Bricks.DOM.getEl(el);
    if (!Bricks.isArray(value)) {
        value = [value];
    }
    var names = name.split(',');
    for (var i = 0; i < names.length; i++) {
        var propValue = Bricks.DOM.normalizeCSSProperty(names[i], value[i] === null || value[i] === undefined ? '' : value[i], el);
        el.style[propValue[0]] = typeof propValue[1] === 'number' ? propValue[1] + 'px' : propValue[1] === null || propValue[1] === undefined ? '' : propValue[1];
    }
};

/**
 * Возвращает позицию элемента относительно окна браузера.
 *
 * @param {Node/String} el Элемент или его id.
 *
 * @return {Array} Массив целых чисел вида [left, top].
 */
Bricks.DOM.getPos = function(el) {
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
};

/**
 * Возвращает размеры элемента.
 *
 * @param {String/Node} el Элемент или его id.
 *
 * @return {Array} Массив из двух элементов [width, height]
 */
Bricks.DOM.getSize = function(el) {
    el = Bricks.DOM.getEl(el);
    return [el.offsetWidth, el.offsetHeight];
};

/**
 * Возвращает реальные экранные размеры элемента, которые отличаются от "физических" после применения к элементу transform: scale().
 *
 * @param {String/Node} el Элемент или его id
 * @returns {Array} Массив из двух элементов [width, height]
 */
Bricks.DOM.getRealSize = function(el) {
    el = Bricks.DOM.getEl(el);
    if (el.getBoundingClientRect) {
        var rect = el.getBoundingClientRect();
        return [rect.right - rect.left, rect.bottom - rect.top];
    } else {
        return Bricks.DOM.getSize(el);
    }
};

/**
 * Возвращает true, если CSS-класс className установлен у элемента el.
 *
 * @param {Node/String} el Элемент или его id.
 * @param {String} className Имя проверяемого класса.
 *
 * @return {Boolean}
 */
Bricks.DOM.classNameExists = function(el, className) {
    el = Bricks.DOM.getEl(el);
    className = Bricks.String.trim(className);
    if (el.classList) {
        return el.classList.contains(className);
    } else {
        var elClassName = typeof el.className === 'string' ? el.className : el.getAttribute('class');
        return new RegExp('(^|\\s)' + className + '(\\s|$)', '').test(elClassName);
    }
};

/**
 * Добавляет CSS-класс элементу, если у элемента нет такого класса.
 *
 * @param {Node/String} el Элемент или его id.
 * @param {String} className Имя добавляемого класса.
 */
Bricks.DOM.addClassName = function(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else if (!Bricks.DOM.classNameExists(el, className)) {
        el = Bricks.DOM.getEl(el);
        if (typeof el.className === 'string') {
            el.className += ' ' + className;
        } else {
            el.setAttribute('class', el.getAttribute('class') + ' ' + className);
        }
    }
};

/**
 * Удаляет CSS-класс у элемента, если у элемента есть такой класс.
 *
 * @param {Node/String} el Элемент или его id.
 * @param {String} className Имя удаляемого класса.
 */
Bricks.DOM.removeClassName = function(el, className) {
    el = Bricks.DOM.getEl(el);
    if (el.classList) {
        el.classList.remove(className);
    } else {
        var isClassNameSupported = typeof el.className === 'string';
        var oldClassName = isClassNameSupported ? el.className : el.getAttribute('class');
        var newClassName = oldClassName.replace(new RegExp('(^|\\s)' + className + '(?=\\s|$)', 'g'), ' ');
        if (oldClassName !== newClassName) {
            if (isClassNameSupported) {
                el.className = newClassName;
            } else {
                el.setAttribute('class', newClassName);
            }
        }
    }
};

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
Bricks.DOM.toggleClassName = function(el, className, adding) {
    if (arguments.length < 3) {
        adding = !Bricks.DOM.classNameExists(el, className);
    }
    return adding ? Bricks.DOM.addClassName(el, className) : Bricks.DOM.removeClassName(el, className);
};

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
Bricks.DOM.getParent = function(el, selector, depth, includeSelf) {
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
};

/**
 * Проверяет, является ли child потомком parent.
 *
 * @param {Node/String} parent
 * @param {Node/String} child
 * @returns {boolean} true, если child является потомком parent.
 */
Bricks.DOM.isAncestor = function(parent, child) {
    parent = Bricks.DOM.getEl(parent);
    child = Bricks.DOM.getEl(child);
    if (parent.contains) {
        return parent.contains(child);
    } else if (parent.compareDocumentPosition) {
        return Boolean(parent.compareDocumentPosition(child) & 16);
    } else {
        while (child) {
            if (parent === child) {
                return true;
            }
            child = child.parentNode;
        }
    }
    return false;
};

/**
 * Навешивает на элементе el обработчик fn на события events, перечисленные через запятую. Обработчик
 * вызывается в контексте ctx и ему передаётся объект события во всех браузерах, включая IE.
 *
 * @param {Node/String} el Элемент или его id.
 * @param {String} events Имена событий через запятую.
 * @param {Function} fn Обработчик события.
 * @param {Object} [ctx] Контекст вызова обработчика.
 */
Bricks.DOM.on = function(el, events, fn, ctx) {
    el = Bricks.DOM.getEl(el);
    if (!Bricks.DOM._eventsController) {
        Bricks.DOM._eventsController = new Bricks.EventsController();
    }
    Bricks.DOM._eventsController.on(Bricks.DOM.getEl(el), events, fn, ctx);
};

/**
 * Снимает с элемента el обработчик fn с событий events, перчисленных через запятую. Обработчик должен быть
 * установлен функцией {@link Bricks.DOM.on}.
 *
 * @param {Node/String} el Элемент или его id.
 * @param {String} events Имена событий через запятую.
 * @param {Function} fn Обработчик события.
 * @param {Object} [ctx] Контекст вызова обработчика.
 */
Bricks.DOM.un = function(el, events, fn, ctx) {
    if (Bricks.DOM._eventsController) {
        Bricks.DOM._eventsController.un(Bricks.DOM.getEl(el), events, fn, ctx);
    }
};

Bricks.DOM.unAll = function() {
    if (Bricks.DOM._eventsController) {
        Bricks.DOM._eventsController.unAll();
    }
};

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
Bricks.DOM.initDrag = function(el, onStart, onMove, onEnd, ctx) {
    var doc = Bricks.DOM.getEl(el).ownerDocument;
    var lastPos;

    Bricks.DOM.on(el, 'mousedown,touchstart', function(evt) {
        var isTouch = evt.type === 'touchstart';
        lastPos = Bricks.Event.getPos(evt);
        if (isTouch && evt.touches.length > 1) {
            return;
        }
        if (!onStart || onStart.call(ctx, evt) !== false) {
            Bricks.DOM.on(doc, isTouch ? 'touchmove' : 'mousemove', onMouseMove);
            Bricks.DOM.on(doc, isTouch ? 'touchend' : 'mouseup', onMouseUp);
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
        Bricks.DOM.un(doc, 'mousemove,touchmove', onMouseMove);
        Bricks.DOM.un(doc, 'mouseup,touchend', onMouseUp);
    }
};

/**
 * Возвращает объект окна, в котором содержится переданный документ.
 *
 * @param {Document} [doc] Необязательный. По-умолчанию текущий документ.
 *
 * @return {window}
 */
Bricks.DOM.getWindow = function(doc) {
    doc = doc || document;
    return doc.parentWindow || doc.defaultView;
};

/**
 * Возвращает корневой элемент на странице. Если compatMode=='CSS1Compat', то это documentElement, иначе body.
 * Если compatMode не определен, то можно считать, что это 'BackCompat'.
 *
 * @param {Document} [doc] Передается в случае работы с другим документом.
 *
 * @return {Node} documentElement или body
 */
Bricks.DOM.getRootElement = function(doc) {
    doc = doc || document;
    return doc.compatMode === 'CSS1Compat' ? doc.documentElement : doc.body;
};

/**
 * Возвращает позицию скрола документа.
 *
 * @param {Document} [doc] Передается в случае работы с другим документом.
 *
 * @return {Array} Массив из двух элементов [left, top].
 */
Bricks.DOM.getDocumentScroll = function(doc) {
    doc = doc || document;
    var win = Bricks.DOM.getWindow(doc);
    return [
        win.pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft || 0,
        win.pageYOffset || doc.documentElement.scrollTop  || doc.body.scrollTop  || 0
    ];
};

/**
 * Возвращает размеры всего документа.
 *
 * @param {Document} [doc] Передается в случае работы с другим документом.
 *
 * @return {Array} Массив из двух элементов [width, height].
 */
Bricks.DOM.getDocumentSize = function(doc) {
    doc = doc || document;
    var viewport = Bricks.DOM.getViewportSize(doc);
    var elem = Bricks.DOM.getRootElement(doc);
    return [Math.max(elem.scrollWidth, viewport[0]), Math.max(elem.scrollHeight, viewport[1])];
};

/**
 * Возвращает размеры видимой части документа.
 *
 * @param {Document} [doc] Передается в случае работы с другим документом.
 *
 * @return {Array} Массив из двух элементов [width, height].
 */
Bricks.DOM.getViewportSize = function(doc) {
    doc = doc || document;
    var elem = Bricks.DOM.getRootElement(doc);
    return [elem.clientWidth, elem.clientHeight];
};

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
Bricks.DOM.normalizeCSSProperty = function(name, value, el) {
    var etalon = el ? el.style : document.documentElement.style;
    name = Bricks.String.camelize(name);

    if (name === 'opacity' && typeof etalon['opacity'] != 'string') {
        return ['filter', value == 1 ? '' : 'Alpha(opacity=' + (value * 100) + ')'];
    }

    if (name === 'float') {
        if (el) {
            name = typeof etalon['cssFloat'] == 'string' ? 'cssFloat' : 'styleFloat';
        }
        return [name, value];
    }

    if (name === 'display' && value === 'flex' && typeof etalon['-ms-flex'] == 'string') {
        return ['display', '-ms-flexbox'];
    }

    if (typeof etalon[name] !== 'string') {
        if (typeof etalon['-ms-' + name] === 'string') {
            return ['-ms-' + name, value];
        }
        var prefixes = ['Moz', 'Webkit', 'O', 'Opera'];
        var camelName = Bricks.String.camelize('-' + name);
        for (var i = 0; i < prefixes.length; i++) {
            if (typeof etalon[prefixes[i] + camelName] == 'string') {
                return [prefixes[i] + camelName, value];
            }
        }
    }

    return [name, value];
};

/**
 * Создаёт из строки str DocumentFragment для последующего добавления его в DOM-дерево.
 *
 * @param {String} str
 * @param {Document} [doc] Документ, в контексте которого создаётся фрагмент. По умолчанию текущий документ.
 *
 * @return {DocumentFragment}
 */
Bricks.DOM.createFragment = function(str, doc) {
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
};
