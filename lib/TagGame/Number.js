//#include index.js
//#include ../Bricks/Widget.js

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
