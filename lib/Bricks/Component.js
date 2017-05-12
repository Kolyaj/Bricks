//#include index.js::
//#include Observer.js

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
    }
});
