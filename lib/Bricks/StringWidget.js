/**
 * @class Bricks.StringWidget
 * @extends Bricks.AbstractWidget
 * @deprecated
 *
 * Виджет, который не вставляется в DOM-дерево, а рендерится в строку методом toString.
 */
Bricks.StringWidget = Bricks.inherit(Bricks.AbstractWidget, {
    _initComponent: function() {
        Bricks.StringWidget.superclass._initComponent.apply(this, arguments);
        this._className = this._getClassNames();
        this._html = this._applyTemplate(this.html);
        this._styles = {};
        this._attrs = {};
    },

    /**
     * Возвращает HTML-строку виджета: тег с атрибутами (style, class) и содержимым.
     *
     * @return {String}
     */
    toString: function() {
        var styles = [];
        for (var property in this._styles) {
            if (this._styles.hasOwnProperty(property)) {
                styles.push(property, ':', this._styles[property], ';');
            }
        }

        this._setAttrib('style', styles.join(''));
        this._setAttrib('class', this._className);

        var result = ['<', this.tagName, ' '];
        for (var attrName in this._attrs) {
            if (this._attrs.hasOwnProperty(attrName)) {
                result.push(attrName, '="', String(this._attrs[attrName]).replace(/"/g, '&quot;'), '"');
            }
        }
        result.push('>', this._html, '</', this.tagName, '>');
        return result.join('');
    },


    /**
     * @param {String} name Имя атрибута.
     * @param {*} value Значение атрибута.
     */
    _setAttrib: function(name, value) {
        this._attrs[name] = value;
    },

    /**
     * @param {String} className Добавляемый класс.
     */
    _addClassName: function(className) {
        this._className += ' ' + className;
    },

    /**
     * @param {Object} props Хэш со стилями.
     */
    _setStyle: function(props) {
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                var propValue = Bricks.DOM.normalizeCSSProperty(name, props[name]);
                this._styles[propValue[0]] = propValue[1];
            }
        }
    }
});
