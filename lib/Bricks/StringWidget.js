//#include index.js
//#include AbstractWidget.js

//#include DOM.js::normalizeCSSProperty

Bricks.StringWidget = Bricks.AbstractWidget.inherit({
    _initComponent: function() {
        Bricks.StringWidget.superclass._initComponent.apply(this, arguments);
        this._className = this._getClassNames();
        this._html = this._applyTemplate(this.html);
        this._styles = {};
        this._attrs = {};
    },

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
                result.push(attrName, '="', this._attrs[attrName], '"');
            }
        }
        result.push('>', this._html, '</', this.tagName, '>');
        return result.join('');
    },
    
    
    _setAttrib: function(name, value) {
        this._attrs[name] = value;
    },

    _addClassName: function(className) {
        this._className += ' ' + className;
    },

    _setStyle: function(props) {
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                var propValue = Bricks.DOM.normalizeCSSProperty(name, props[name]);
                this._styles[propValue[0]] = propValue[1];
            }
        }
    }
});