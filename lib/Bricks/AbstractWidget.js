//#include Component.js

//#include DOM.js::getEl::normalizeCSSProperty
//#include String.js::trim::uncamelize::compile

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
        this._renderTo = this.renderTo ? Bricks.DOM.getEl(this.renderTo) : null;
        this._doc = this.doc || (this._renderTo ? this._renderTo.ownerDocument : document);
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
                if (protoChain[i].Bricks_AbstractWidget__docs[j] == this._doc) {
                    needRule = false;
                    break;
                }
            }
            if (needRule) {
                protoChain[i].Bricks_AbstractWidget__docs.push(this._doc);
                cssRules.unshift(this._compileCSSRule('', protoChain[i].css));
            }
        }
        var cssText = Bricks.String.trim(cssRules.join(''));
        if (cssText) {
            var styleEl = this._doc.createElement('style');
            styleEl.type = 'text/css';
            if (styleEl.styleSheet) {
                styleEl.styleSheet.cssText = cssText;
            } else if (styleEl.innerText == '') {
                styleEl.innerText = cssText;
            } else {
                styleEl.innerHTML = cssText;
            }
            this._doc.getElementsByTagName('head')[0].appendChild(styleEl);
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
                        var propertySupported = typeof this._doc.documentElement.style[Bricks.DOM.normalizeCSSProperty(property.substr(2), '')[0]] == 'string';
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