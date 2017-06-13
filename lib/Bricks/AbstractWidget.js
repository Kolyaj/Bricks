//#require Bricks.Component

//#require Bricks.getPrototypeChain
//#require Bricks.DOM.getEl
//#require Bricks.DOM.normalizeCSSProperty
//#require Bricks.DOM.createFragment
//#require Bricks.String.trim
//#require Bricks.String.uncamelize
//#require Bricks.String.compile

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

    $$_tplsCache: {},

    _initComponent: function() {
        Bricks.AbstractWidget.superclass._initComponent.apply(this, arguments);
        this._renderTo = this.renderTo ? Bricks.DOM.getEl(this.renderTo) : null;
        this._doc = this.doc || (this._renderTo ? this._renderTo.ownerDocument : document);
        this._buildCss();
    },


    _getClassNames: function() {
        var protoChain = Bricks.getPrototypeChain(this, 'className');
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
        var protoChain = Bricks.getPrototypeChain(this, 'css');
        var cssRules = [];
        for (var i = 0; i < protoChain.length; i++) {
            if (!protoChain[i].hasOwnProperty('$$_docs')) {
                protoChain[i].$$_docs = [];
            }
            var needRule = true;
            for (var j = 0; j < protoChain[i].$$_docs.length; j++) {
                if (protoChain[i].$$_docs[j] == this._doc) {
                    needRule = false;
                    break;
                }
            }
            if (needRule) {
                protoChain[i].$$_docs.push(this._doc);
                cssRules.unshift(this._compileCSSRule('', protoChain[i].css));
            }
        }

        var cssText = Bricks.String.trim(cssRules.join(''));
        cssText = cssText.replace(/^\{\s*}/, '');
        if (cssText) {
            var stylesId = '$$_styles';
            var oldStyleEl = Bricks.DOM.getEl(stylesId);
            if (oldStyleEl) {
                var oldCssText = (oldStyleEl.styleSheet && oldStyleEl.styleSheet.cssText) || oldStyleEl.innerText || oldStyleEl.innerHTML || '';
                if (oldCssText) {
                    cssText = oldCssText + cssText;
                    Bricks.DOM.remove(oldStyleEl);
                }
            }
            var styleEl = this._doc.createElement('style');
            styleEl.type = 'text/css';
            styleEl.id = stylesId;
            if (styleEl.styleSheet) {
                styleEl.styleSheet.cssText = cssText;
            } else {
                styleEl = Bricks.DOM.createFragment('<style type="text/css" id="' + stylesId + '">' + cssText + '</style>', this._doc);
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
                    } else if (/^@/.test(property)) {
                        cascades.push([property, ' {\n', this._compileCSSRule(rule, value), '}'].join(''));
                    } else {
                        cascades.push(this._compileCSSRule(rule + (property.indexOf(':') == 0 ? '' :' ') + property, value));
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
        if (tpl) {
            if (!this.$$_tplsCache[tpl]) {
                this.$$_tplsCache[tpl] = Bricks.String.compile(tpl);
            }
            return this.$$_tplsCache[tpl].call(this);
        } else {
            return '';
        }
    }
});
