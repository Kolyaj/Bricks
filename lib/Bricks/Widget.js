//#include AbstractWidget.js

//#include DOM.js::getEls::setStyle::getPos::getSize::classNameExists::addClassName::removeClassName::toggleClassName::on::un::remove

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