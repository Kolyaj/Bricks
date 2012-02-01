//#include AbstractWidget.js

//#include DOM.js::getEls

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
     * Возвращает первый DOM-элемент из виджета с соответствующим CSS-классом. Если класс не указан, возвращается
     * корневой элемент.
     *
     * @param {String} [className]
     * @param {Boolean} [force] Если true, то элемент ищется заново, а не берётся из кэша.
     *
     * @return {Node}
     */
    getEl: function(className, force) {
        this.Bricks_Widget__elementsCache = this.Bricks_Widget__elementsCache || {};
        if (className) {
            if (!this.Bricks_Widget__elementsCache[className] || force) {
                this.Bricks_Widget__elementsCache[className] = Bricks.DOM.getEls('!.' + className, this._el);
            }
            return this.Bricks_Widget__elementsCache[className];
        }
        return this._el;
    }
});