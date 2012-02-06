//#include index.js
//#include ../Bricks/Widget.js

//#include Field.js

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