var Tag = (function() {
var TagGame = {};
var Bricks = {
    /**
     * Возвращает true, если переданный аргумент является массивом, иначе false.
     *
     * @param {*} obj
     *
     * @return {Boolean}
     */
    isArray: function(obj) {
        return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) == '[object Array]';
    },

    /**
     * Копирует свойства из всех аргументов, начиная со второго, в dst.
     *
     * @param {Object} dst Объект, в который копируются свойства.
     *
     * @return {Object} Объект dst.
     */
    mixin: function(dst) {
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i]) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        dst[prop] = arguments[i][prop];
                    }
                }
                if (arguments[i].hasOwnProperty('toString')) {
                    dst['toString'] = arguments[i]['toString'];
                }
            }
        }
        return dst;
    },

    /**
     * Создаёт конструктор, прототип которого наследует прототип текущего конструктора.
     * Для создания ничего не наследующего конструктора следует использовать Bricks.create({...}).
     *
     * @param {Object} proto Объект с методами и свойствами, копирующимися в прототип создаваемого конструктора.
     *
     * @return {Function} Созданный конструктор.
     */
    create: function(proto) {
        proto = proto || {};
        var parent = typeof this == 'function' ? this : Object;
        if (!proto.hasOwnProperty('constructor')) {
            proto.constructor = function() {
                parent.apply(this, arguments);
            };
        }
        var F = function() {};
        F.prototype = parent.prototype;
        proto.constructor.prototype = new F();
        for (var name in proto) {
            if (proto.hasOwnProperty(name)) {
                proto.constructor.prototype[name] = proto[name];
            }
        }
        proto.constructor.superclass = parent.prototype;
        proto.constructor.inherit = Bricks.create;
        return proto.constructor;
    },

    '': ''
};

/**
 * @class Bricks.Observer
 * @extends Object
 *
 * Класс, предоставляющий интерфейс для генерации событий и для добавления слушателей. Нет никакого жесткого
 * списка событий, которые может генерировать данный класс. Типом события является обычная строка.
 * Подписчики вызываются в обратном порядке, в котором они были подписаны. Если в одном из обработчиков
 * произойдет ошибка, вызовется метод {@link Bricks.Observer._handleListenerError} текущего обсервера, которому будет передан
 * объект ошибки, остальные обработчики будут вызваны в штатном режиме.
 * Подписчикам передаётся объект с обязательными свойствами type и target, расширенный свойствами объекта, переданного
 * вторым аргументом в функцию {@link Bricks.Observer._fireEvent}.
 * Чтобы остановить обработку события, обработчик должен вернуть false.
 * Для объектов, порожденных Bricks.Observer, можно также использовать {@link Bricks.DOM.on} для навешивания
 * обработчиков.
 */
Bricks.Observer = Bricks.create({
    /**
     * @constructor
     */
    constructor: function() {
        this.Bricks_Observer__listeners = {};
    },

    /**
     * Подписывает на событие.
     *
     * @param {String} name Имя события.
     * @param {Function} fn Фукнция, вызываемая при возникновении события.
     */
    addEventListener: function(name, fn) {
        this.Bricks_Observer__listeners[name] = this.Bricks_Observer__listeners[name] || [];
        this.Bricks_Observer__listeners[name].push(fn);
    },

    /**
     * Отписка от события. Параметры должны быть в точности теми же, что и при подписке.
     *
     * @param {String} name Имя события.
     * @param {Function} fn Подписанный обработчик.
     */
    removeEventListener: function(name, fn) {
        if (this.Bricks_Observer__listeners[name]) {
            for (var i = 0; i < this.Bricks_Observer__listeners.length; i++) {
                if (this.Bricks_Observer__listeners[i] == fn) {
                    this.Bricks_Observer__listeners.splice(i, 1);
                }
            }
        }
    },

    /**
     * Посылает событие name с параметрами data.
     *
     * @param {String} name Имя события.
     * @param {Object} [data] Параметры, расширяемые передаваемый в обработчики объект события.
     *
     * @return {Boolean} false, если событие было остановлено, иначе true.
     */
    _fireEvent: function(name, data) {
        var listeners = this.Bricks_Observer__listeners[name] || [];
        if (this.Bricks_Observer__listeners['*']) {
            listeners = listeners.concat(this.Bricks_Observer__listeners['*']);
        }
        var evt = Bricks.mixin({}, data, {
            type: name,
            target: this
        });
        for (var i = listeners.length - 1; i >= 0; i--) {
            try {
                if (listeners[i].call(this, evt) === false) {
                    return false;
                }
            } catch (err) {
                this._handleListenerError(err);
            }
        }
        return true;
    },

    /**
     * Обработчик ошибок, возникающих в подписчиках. По умолчанию бросает исключение в отдельном потоке, не
     * прерывая текущий. При желании можно переопределить данный метод, чтобы, например, логировать ошибки.
     *
     * @param {Error} err Объект ошибки.
     */
    _handleListenerError: function(err) {
        setTimeout(function() { throw err; }, 10);
    }
});


/**
 * @class Bricks.Component
 * @extends Bricks.Observer
 *
 * Абстрактный класс-заготовка для создания классов, принимающих в конструкторе хэш параметров. Позволяет создавать
 * классы, свойства и методы которых легко переопределить как в наследуемых классах, так и при создании экземпляра
 * класса.
 */
Bricks.Component = Bricks.Observer.inherit({
    /**
     * @constructor
     * @param {Object} [config] Объект с конфигурационными параметрами.
     */
    constructor: function(config) {
        Bricks.Component.superclass.constructor.apply(this, arguments);
        this._initialConfig = config || {};
        for (var i in this._initialConfig) {
            if (this._initialConfig.hasOwnProperty(i)) {
                this[i] = this._initialConfig[i];
            }
        }
        this._initComponent();
    },

    /**
     * Инициализация компонента. В наследуемых классах в качестве конструктора следует переопределять именно
     * этот метод, тогда до вызова родительского initComponent, когда необходимо доопределить некоторые
     * параметры, конфигурационный объект, переданный в конструктор, будет уже скопирован в this.
     */
    _initComponent: function() {
    },


    /**
     * Возвращает цепочку прототипов, содержащих свойство prop, от объекта до Bricks.Component.prototype.
     *
     * @param {String} prop Имя свойства.
     *
     * @return {Array} Массив объектов-прототипов.
     */
    _getPrototypeChain: function(prop) {
        var result = this.hasOwnProperty(prop) ? [this] : [];
        var proto = this.constructor.prototype;
        while (proto != Bricks.Component.prototype) {
            if (proto.hasOwnProperty(prop)) {
                result.push(proto);
            }
            proto = proto.constructor.superclass;
        }
        return result;
    }
});


Bricks.String = {
    /**
     * Удаляет пробельные символы из начала и конца строки.
     *
     * @param {String} str
     *
     * @return {String} Копия строки без начальных и конечных пробельных символов.
     */
    trim: function(str) {
        return str.replace(/^\s+|\s+$/g, '');
    },





    /**
     * Экранирует HTML-теги в HTML-сущности.
     *
     * @param {String} str
     *
     * @return {String}
     */
    escapeHTML: function(str) {
        var div = document.createElement('DIV');
        var text = document.createTextNode(str);
        div.appendChild(text);
        return div.innerHTML;
    },

    /**
     * Переводит строки из dash-style в camelStyle.
     *
     * @param {String}
     *
     * @return {String}
     */
    camelize: function(str) {
        return str.replace(/-([a-z])/g, function() {
            return arguments[1].toUpperCase();
        });
    },

    /**
     * Выполняет преобразование, обратное {@link #camelize}, т.е. строку вида camelCaseStyle преобразует в
     * camel-case-style.
     *
     * @param {String} str
     *
     * @return {String}
     */
    uncamelize: function(str) {
        return str.replace(/[A-Z]/g, function(letter) {
            return '-' + letter.toLowerCase();
        });
    },





    /**
     * Компилирует строку str, содержащую шаблон, в функцию, этот шаблон применяющую к своему контексту.
     * Шаблон понимает три вида тегов:
     *      * <%= Выражение, которое необходимо вывести. HTML теги будут экранированы. %>
     *      * <%&= Выражение, которое необходимо вывести. HTML теги не будут экранироваться. %>
     *      * <% for arrayName as itemName %><% endfor %>
     *      * <% for arrayName as keyName => itemName %><% endfor %>
     *      * <% Произвольный JS-код %>
     * Всё, что находится вне этих тегов, выводится как есть.
     * Переменные в шаблон передаются в контексте вызова результирующей функции.
     * Пример: Bricks.String.compile(str).call({var1: value1, var2: value2});
     *
     * @param {String} str
     *
     * @return {Function}
     */
    compile: function(str) {
        var resultVarName = '$_' + Math.round(Math.random() * 1.0e9);
        var resultBody = ['var ', resultVarName, '=[];'];
        resultBody.push(str.replace(/(<%((&)?=)?(.*?)%>)|([\s\S]+?(?=(<%|$)))/g, function(string, tag, assign, noEscape, tagContent) {
            var replacement;
            if (tag) {
                if (assign) {
                    if (noEscape) {
                        replacement = [resultVarName, '.push(', tagContent, ');'];
                    } else {
                        replacement = [resultVarName, '.push(arguments.callee.escapeHTML(String(', tagContent, ')));'];
                    }
                } else {
                    replacement = [tagContent, '\n'];
                }
            } else {
                replacement = [resultVarName, '.push("', string.replace(/./g, getCharUnicode), '");'];
            }
            return replacement.join('');
        }));
        resultBody.push('return ', resultVarName, '.join("");');
        var result = new Function(resultBody.join(''));
        result.escapeHTML = Bricks.String.escapeHTML;
        return result;

        function getCharUnicode(ch) {
            var code = ch.charCodeAt(0).toString(16);
            while (code.length < 4) {
                code = '0' + code;
            }
            return '\\u' + code;
        }
    },

    '': ''
};

Bricks.Event = {

    


    '': ''
};

//noinspection JSUnusedGlobalSymbols
Bricks.DOM = {
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


    '': ''
};



/**
 * @class Bricks.AbstractWidget
 * @extends Bricks.Component
 *
 * Базовый класс для виджетов, требующих CSS. Занимается добавлением таблиц стилей в документ.
 */
Bricks.AbstractWidget = Bricks.Component.inherit({
    /**
     * @type Node/String
     * Элемент, куда отрендерить виджет.
     */
    renderTo: null,

    /**
     * @type String
     * Имя тега корневого элемента.
     */
    tagName: 'div',

    /**
     * @type String
     * CSS-класс корневого элемента.
     */
    className: '',

    /**
     * @type Object
     * Стили для виджета.
     */
    css: {},

    /**
     * @type String
     * HTML шаблон виджета.
     */
    html: '',

    /**
     * @type Document
     * Родительский документ для виджета.
     */
    doc: null,

    _initComponent: function() {
        Bricks.AbstractWidget.superclass._initComponent.apply(this, arguments);
        if (this.renderTo) {
            this.renderTo = Bricks.DOM.getEl(this.renderTo);
        }
        if (!this.doc) {
            this.doc = this.renderTo ? this.renderTo.ownerDocument : document;
        }
        this._buildCss();
    },

    destroy: function() {
        this._fireEvent('destroy');
    },


    _getClassNames: function() {
        var protoChain = this._getPrototypeChain('className');
        var classNames = [];
        for (var i = 0; i < protoChain.length; i++) {
            classNames.push(protoChain[i].className);
        }
        return classNames.join(' ');
    },

    /**
     * Компилирует и добавляет в документ CSS текущего виджета.
     */
    _buildCss: function() {
        var protoChain = this._getPrototypeChain('css');
        var cssRules = [];
        for (var i = 0; i < protoChain.length; i++) {
            if (!protoChain[i].hasOwnProperty('Bricks_AbstractWidget__docs')) {
                protoChain[i].Bricks_AbstractWidget__docs = [];
            }
            var needRule = true;
            for (var j = 0; j < protoChain[i].Bricks_AbstractWidget__docs.length; j++) {
                if (protoChain[i].Bricks_AbstractWidget__docs[j] == this.doc) {
                    needRule = false;
                    break;
                }
            }
            if (needRule) {
                protoChain[i].Bricks_AbstractWidget__docs.push(this.doc);
                cssRules.unshift(this._compileCSSRule('', protoChain[i].css));
            }
        }
        var cssText = Bricks.String.trim(cssRules.join(''));
        if (cssText) {
            var styleEl = this.doc.createElement('style');
            styleEl.type = 'text/css';
            if (styleEl.styleSheet) {
                styleEl.styleSheet.cssText = cssText;
            } else if (styleEl.innerText == '') {
                styleEl.innerText = cssText;
            } else {
                styleEl.innerHTML = cssText;
            }
            this.doc.getElementsByTagName('head')[0].appendChild(styleEl);
        }
    },

    /**
     * Компилирует в строку CSS правило.
     *
     * @param {String} rule
     * @param {Object} properties
     *
     * @return {String}
     */
    _compileCSSRule: function(rule, properties) {
        var cascades = [];
        var propStrings = [];
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                var value = properties[property];
                if (typeof value == 'object') {
                    if (/^[?^] /.test(property)) {
                        var propertySupported = typeof this.doc.documentElement.style[Bricks.DOM.normalizeCSSProperty(property.substr(2), '')[0]] == 'string';
                        var isValidSelector = (property.charAt(0) == '?' && propertySupported) || (property.charAt(0) == '^' && !propertySupported);
                        if (isValidSelector) {
                            cascades.push(this._compileCSSRule(rule, value));
                        }
                    } else {
                        cascades.push(this._compileCSSRule(rule + ' ' + property, value));
                    }
                } else {
                    var propname = Bricks.DOM.normalizeCSSProperty(property, value);
                    propStrings.push('    ', Bricks.String.uncamelize(propname[0]), ': ', propname[1], ';\n');
                }
            }
        }
        return (rule ? [rule, ' {\n', propStrings.join(''), '}'].join('') : '') + cascades.join('');
    },

    /**
     * Вызывает шаблон в контексте текущего виджета.
     *
     * @param {String} tpl Строка с шаблоном.
     *
     * @return {String} Результат применения шаблона.
     */
    _applyTemplate: function(tpl) {
        return tpl ? Bricks.String.compile(tpl).call(this) : '';
    }
});


/**
 * @class Bricks.Widget
 * @extends Bricks.AbstractWidget
 *
 * Класс для создания виджетов, содержащих внутри и JavaScript, и HTML, и CSS.
 */
Bricks.Widget = Bricks.AbstractWidget.inherit({
    /**
     * @type String
     * Namespace корневого DOM-элемента. Если задан, то элемент создаётся с помощью createElementNS.
     */
    namespace: '',

    _initComponent: function() {
        Bricks.Widget.superclass._initComponent.apply(this, arguments);
        this._el = this.namespace ? this.doc.createElementNS(this.namespace, this.tagName) : this.doc.createElement(this.tagName);
        if (this.className) {
            var classNames = this._getClassNames();
            if (this.namespace) {
                this._el.setAttribute('class', classNames);
            } else {
                this._el.className = classNames;
            }
        }
        if (this.html) {
            this._el.innerHTML = this._applyTemplate(this.html);
        }
        if (this.renderTo) {
            this.renderTo.appendChild(this._el);
        }
    },

    destroy: function() {
        Bricks.DOM.remove(this.getEl());
        Bricks.Widget.superclass.destroy.apply(this, arguments);
    },

    /**
     * Возвращает корневой элемент виджета.
     *
     * @return {Node}
     */
    getEl: function() {
        return this._el;
    },


    /**
     * Возвращает первый DOM-элемент из виджета с соответствующим CSS-классом. Если класс не указан, возвращается
     * корневой элемент.
     *
     * @param {String} [elClassName]
     * @param {Boolean} [force] Если true, то элемент ищется заново, а не берётся из кэша.
     *
     * @return {Node}
     */
    _getEl: function(elClassName, force) {
        this.Bricks_Widget__elementsCache = this.Bricks_Widget__elementsCache || {};
        if (elClassName) {
            if (!this.Bricks_Widget__elementsCache[elClassName] || force) {
                this.Bricks_Widget__elementsCache[elClassName] = Bricks.DOM.getEls('!.' + elClassName, this._el);
            }
            return this.Bricks_Widget__elementsCache[elClassName];
        }
        return this._el;
    },

    /**
     * Проверяет, имеется ли класс className у элемента с классом elClassName. Если elClassName опущен, то проверяется
     * у корневого элемента.
     *
     * @param {String} elClassName Имя класса проверяемого элемента или проверяемый класс, если проверяется корневой элемент.
     * @param {String} [className] Проверяемый класс.
     *
     * @return {Boolean} true, если класс у элемента есть.
     */
    _classNameExists: function(elClassName, className) {
        if (arguments.length == 1) {
            className = elClassName;
            elClassName = '';
        }
        return Bricks.DOM.classNameExists(this._getEl(elClassName), className);
    },

    /**
     * Добавляет класс className элементу с классом elClassName. Если elClassName опущен, то класс добавляется
     * корневому элементу.
     *
     * @param {String} elClassName Имя класса элемента или имя добавляемого класаа.
     * @param {String} [className] Имя добавляемого класса.
     *
     * @return {Boolean} true, если класс был добавлен.
     */
    _addClassName: function(elClassName, className) {
        if (arguments.length == 1) {
            className = elClassName;
            elClassName = '';
        }
        return Bricks.DOM.addClassName(this._getEl(elClassName), className);
    },

    /**
     * Удаляет класс className у элемента с классом elClassName. Если elClassName опущен, то класс удаляется
     * у корневого элемента.
     *
     * @param {String} elClassName Имя класс элемента или имя удаляемого класса.
     * @param {String} [className] Имя удаляемого класса.
     *
     * @return {Boolean} true, если класс был удалён.
     */
    _removeClassName: function(elClassName, className) {
        if (arguments.length == 1) {
            className = elClassName;
            elClassName = '';
        }
        return Bricks.DOM.removeClassName(this._getEl(elClassName), className);
    },

    /**
     * Добавляет или удаляет класс className у элемента с классом elClassName в зависимости от параметра adding.
     * Если elClassName опущен, то класс изменяется у корневого элемента. Если adding опущен, то наличие класса
     * инвертируется.
     *
     * @param {String} elClassName Имя класса изменяемого элемента.
     * @param {String} [className] Изменяемый класс.
     * @param {Boolean} [adding] Добавить или удалить класс.
     *
     * @return {Boolean} true, если класс был изменён.
     */
    _toggleClassName: function(elClassName, className, adding) {
        if (arguments.length == 1 || (arguments.length == 2 && typeof className != 'string')) {
            adding = className;
            className = elClassName;
            elClassName = '';
        }
        return Bricks.DOM.toggleClassName(this._getEl(elClassName), className, adding);
    },

    /**
     * Навешивает на элемент или виджет el функцию fn на события events. Если el строка, то она считается классом
     * элемента текущего виджета. Если el опущен, то события вешаются на кортевой элемент.
     *
     * @param {Object} el Элемент, виджет или класс элемента.
     * @param {String|Function} events Список событий через запятую.
     * @param {Function} fn Обработчик события.
     */
    _on: function(el, events, fn) {
        if (arguments.length < 3) {
            fn = events;
            events = el;
            el = '';
        }
        el = el || '';
        Bricks.DOM.on(typeof el == 'string' ? this._getEl(el) : el, events, fn, this);
    },

    /**
     * Снимает обработчик, назначенный методом {@link Bricks.Widget._on}. Формат аргументов тот же.
     *
     * @param {Object} el Элемент, виджет или класс элемента.
     * @param {String|Function} events Список событий через запятую.
     * @param {Function} fn Обработчик события.
     */
    _un: function(el, events, fn) {
        if (arguments.length < 3) {
            fn = events;
            events = el;
            el = '';
        }
        el = el || '';
        Bricks.DOM.un(typeof el == 'string' ? this._getEl(el) : el, events, fn, this);
    },

    /**
     * Вызывает функцию {@link Bricks.DOM.getPos} и передаёт ей первый элемент с классом elClassName или корневой
     * элемент, если elClassName опущен.
     *
     * @param {String} [elClassName]
     *
     * @return {Array} Позиция элемента относительно окна браузера.
     */
    _getElPos: function(elClassName) {
        return Bricks.DOM.getPos(this._getEl(elClassName));
    },

    /**
     * Вызывает функцию {@link Bricks.DOM.getSize} и передаёт ей первый элемент с классом elClassName или корневой
     * элемент, если elClassName опущен.
     *
     * @param {String} [elClassName]
     *
     * @return {Array} Размеры элемента.
     */
    _getElSize: function(elClassName) {
        return Bricks.DOM.getSize(this._getEl(elClassName));
    },

    /**
     * Устанавливает стили для первого элемента с классом elClassName. Если elClassName пропущен, то изменяется корневой
     * элемент.
     *
     * @param {String|Object} elClassName Имя класса или объект со стилями, если имя класса опущено.
     * @param {Object} [style] Объект со стилями.
     */
    _setStyle: function(elClassName, style) {
        if (arguments.length == 1) {
            style = elClassName;
            elClassName = '';
        }
        Bricks.DOM.setStyle(this._getEl(elClassName), style);
    },

    /**
     * Возвращает массив внутренних элементов с классом className.
     *
     * @param {String} className
     *
     * @return {Array}
     */
    _getEls: function(className) {
        return Bricks.DOM.getEls('.' + className, this._el);
    }
});



TagGame.Number = Bricks.Widget.inherit({
    number: 1,


    tagName: 'span',

    className: 'tag-game-number',

    css: {
        '.tag-game-number': {
            'font-weight': 'bold',

            'display': 'inline-block',
            'width': '30px',
            'height': '30px',

            'text-align': 'center',
            'line-height': '30px',
            'vertical-align': 'middle',

            'cursor': 'pointer',
            'border': '2px solid #555',
            'border-radius': '5px'
        }
    },

    html:   '<%= this.number %>',

    _initComponent: function() {
        TagGame.Number.superclass._initComponent.apply(this, arguments);
        this._on('click', this.TagGame_Number__onClick);
    },

    getNumber: function() {
        return this.number;
    },


    TagGame_Number__onClick: function() {
        this._fireEvent('click');
    }
});


Bricks.Function = {
    /**
     * Вызывает функцию fn через delay миллисекунд в контексте ctx с аргументами args.
     *
     * @param {Function} fn
     * @param {Number} delay
     * @param {Object} [ctx]
     * @param {Array} [args]
     *
     * @return {Number} Идентификатор таймаута.
     */
    defer: function(fn, delay, ctx, args) {
        return window.setTimeout(function() {
            fn.apply(ctx, args || []);
        }, delay);
    },

    '': ''
};

TagGame.Field = Bricks.Widget.inherit({
    className: 'tag-game-field',

    css: {
        '.tag-game-field__table': {
            'border-collapse': 'collapse'
        },

        '.tag-game-field__cell': {
            'width': '40px',
            'height': '40px',
            'padding': '0',

            'text-align': 'center',
            'vertical-align': 'middle',

            'border': '2px solid #CCC'
        }
    },

    html:   '<table class="tag-game-field__table">' +
                '<% for (var i = 0; i < 4; i++) { %>' +
                    '<tr>' +
                        '<% for (var j = 0; j < 4; j++) { %>' +
                            '<td class="tag-game-field__cell"></td>' +
                        '<% } %>' +
                    '</tr>' +
                '<% } %>' +
            '</table>',

    _initComponent: function() {
        TagGame.Field.superclass._initComponent.apply(this, arguments);

        this._shuffling = false;
        this._numbers = new Array(16);
        for (var i = 0; i < 15; i++) {
            var number = new TagGame.Number({
                number: i + 1,
                renderTo: this._getEl('tag-game-field__table').rows[Math.floor(i / 4)].cells[i % 4]
            });
            this._on(number, 'click', this.TagGame_Field__onNumberClick);
            this._numbers[i] = number;
        }
    },

    move: function(cell) {
        var number = this._getNumberByCell(cell);
        if (number) {
            var siblingCells = this._getSiblingCells(cell);
            var targetSibling = null;
            for (var i = 0; i < siblingCells.length; i++) {
                if (!this._getNumberByCell(siblingCells[i])) {
                    targetSibling = siblingCells[i];
                    break;
                }
            }
            if (targetSibling) {
                this._numbers[this._getIndexByCell(targetSibling)] = number;
                this._numbers[cell[0] * 4 + cell[1]] = null;
                this._getEl('tag-game-field__table').rows[targetSibling[0]].cells[targetSibling[1]].appendChild(number.getEl());
                if (!this._shuffling) {
                    this._fireEvent('move');
                }
            }
        }
    },

    shuffle: function(count, callback, ctx) {
        this._shuffling = true;
        (function(i) {
            if (i < count) {
                var availableCells = this._getSiblingCells(this._findEmptyCell());
                this.move(availableCells[Math.floor(Math.random() * availableCells.length)]);
                Bricks.Function.defer(arguments.callee, 50, this, [i + 1]);
            } else {
                this._shuffling = false;
                if (callback) {
                    callback.call(ctx);
                }
            }
        }).call(this, 0);
    },
    
    isComplete: function() {
        for (var i = 0; i < 15; i++) {
            if (!this._numbers[i] || this._numbers[i].getNumber() != i + 1) {
                return false;
            }
        }
        return true;
    },


    _getNumberByCell: function(cell) {
        return this._numbers[this._getIndexByCell(cell)];
    },

    _getSiblingCells: function(cell) {
        var siblings = [];
        if (cell[0] > 0) {
            siblings.push([cell[0] - 1, cell[1]]);
        }
        if (cell[1] < 3) {
            siblings.push([cell[0], cell[1] + 1]);
        }
        if (cell[0] < 3) {
            siblings.push([cell[0] + 1, cell[1]]);
        }
        if (cell[1] > 0) {
            siblings.push([cell[0], cell[1] - 1]);
        }
        return siblings;
    },

    _getIndexByCell: function(cell) {
        return cell[0] * 4 + cell[1];
    },

    _getCellByNumber: function(number) {
        for (var i = 0; i < this._numbers.length; i++) {
            if (this._numbers[i] == number) {
                return [Math.floor(i / 4), i % 4];
            }
        }
    },

    _findEmptyCell: function() {
        for (var i = 0; i < this._numbers.length; i++) {
            if (!this._numbers[i]) {
                return [Math.floor(i / 4), i % 4];
            }
        }
    },


    TagGame_Field__onNumberClick: function(evt) {
        if (!this._shuffling) {
            this.move(this._getCellByNumber(evt.target));
        }
    }
});

TagGame.Game = Bricks.Widget.inherit({
    className: 'tag-game-game',

    css: {
        '.tag-game-game': {
            'width': '170px'
        },
        '.tag-game-game__ctrls': {
            'padding': '10px',

            'text-align': 'center'
        }
    },

    html:   '<div class="tag-game-game__field"></div>' +
            '<div class="tag-game-game__ctrls">' +
                '<button class="tag-game-game__shuffle">Перемешать</button>' +
            '</div>',

    _initComponent: function() {
        TagGame.Game.superclass._initComponent.apply(this, arguments);
        this._field = new TagGame.Field({
            renderTo: this._getEl('tag-game-game__field')
        });

        this._on('tag-game-game__shuffle', 'click', this.TagGame_Game__onShuffleClick);
        this._on(this._field, 'move', this.TagGame_Game__onMoveNumber);
    },

    shuffle: function(count, callback, ctx) {
        this._getEl('tag-game-game__shuffle').disabled = true;
        this._field.shuffle(count, function() {
            this._getEl('tag-game-game__shuffle').disabled = false;
            if (callback) {
                callback.call(ctx);
            }
        }, this)
    },


    TagGame_Game__onShuffleClick: function() {
        this.shuffle(100);
    },

    TagGame_Game__onMoveNumber: function() {
        if (this._field.isComplete()) {
            this._fireEvent('win');
        }
    }
});

    return TagGame.Game;
})();

