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
        Bricks.mixin(this, config);
        this._initComponent();
    },

    /**
     * Инициализация компонента. В наследуемых классах в качестве конструктора следует переопределять именно
     * этот метод, тогда до вызова родительского initComponent, когда необходимо доопределить некоторые
     * параметры, конфигурационный объект, переданный в конструктор, будет уже скопирован в this.
     */
    _initComponent: function() {
        this._eventsController = new Bricks.EventsController();
    },

    destroy: function() {
        this._eventsController.unAll();
        this._fireEvent('destroy');
    },


    /**
     * Навешивает на элемент или компонент el метод fn на события events.
     *
     * @param {Object|String} el Элемент, компонент или id элемента.
     * @param {String} events Список событий через запятую.
     * @param {Function} fn Метод текущего объекта – обработчик события.
     */
    _on: function(el, events, fn) {
        this._eventsController.on(typeof el == 'string' ? Bricks.DOM.getEl(el) : el, events, fn, this);
    },

    /**
     * Снимает обработчик, назначенный методом {@link Bricks.Component._on}. Формат аргументов тот же.
     *
     * @param {Object|String} el Элемент, компонент или id элемента.
     * @param {String} events Список событий через запятую.
     * @param {Function} fn Метод текущего объекта – обработчик события.
     */
    _un: function(el, events, fn) {
        this._eventsController.un(typeof el == 'string' ? Bricks.DOM.getEl(el) : el, events, fn, this);
    }
});
