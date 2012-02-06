//#include index.js
//#include ../Bricks/Widget.js

//#include Number.js
//#include ../Bricks/Function.js::defer

TagGame.Field = Bricks.Widget.inherit({
    className: 'tag-game-field',

    css: {
        '.tag-game-field__table': {
            'border-collapse': 'collapse'
        },

        '.tag-game-field__cell': {
            'width': '40px',
            'height': '40px',
            'padding': '0',

            'text-align': 'center',
            'vertical-align': 'middle',

            'border': '2px solid #CCC'
        }
    },

    html:   '<table class="tag-game-field__table">' +
                '<% for (var i = 0; i < 4; i++) { %>' +
                    '<tr>' +
                        '<% for (var j = 0; j < 4; j++) { %>' +
                            '<td class="tag-game-field__cell"></td>' +
                        '<% } %>' +
                    '</tr>' +
                '<% } %>' +
            '</table>',

    _initComponent: function() {
        TagGame.Field.superclass._initComponent.apply(this, arguments);

        this._shuffling = false;
        this._numbers = new Array(16);
        for (var i = 0; i < 15; i++) {
            var number = new TagGame.Number({
                number: i + 1,
                renderTo: this._getEl('tag-game-field__table').rows[Math.floor(i / 4)].cells[i % 4]
            });
            this._on(number, 'click', this.TagGame_Field__onNumberClick);
            this._numbers[i] = number;
        }
    },

    move: function(cell) {
        var number = this._getNumberByCell(cell);
        if (number) {
            var siblingCells = this._getSiblingCells(cell);
            var targetSibling = null;
            for (var i = 0; i < siblingCells.length; i++) {
                if (!this._getNumberByCell(siblingCells[i])) {
                    targetSibling = siblingCells[i];
                    break;
                }
            }
            if (targetSibling) {
                this._numbers[this._getIndexByCell(targetSibling)] = number;
                this._numbers[cell[0] * 4 + cell[1]] = null;
                this._getEl('tag-game-field__table').rows[targetSibling[0]].cells[targetSibling[1]].appendChild(number.getEl());
                if (!this._shuffling) {
                    this._fireEvent('move');
                }
            }
        }
    },

    shuffle: function(count, callback, ctx) {
        this._shuffling = true;
        (function(i) {
            if (i < count) {
                var availableCells = this._getSiblingCells(this._findEmptyCell());
                this.move(availableCells[Math.floor(Math.random() * availableCells.length)]);
                Bricks.Function.defer(arguments.callee, 50, this, [i + 1]);
            } else {
                this._shuffling = false;
                if (callback) {
                    callback.call(ctx);
                }
            }
        }).call(this, 0);
    },
    
    isComplete: function() {
        for (var i = 0; i < 15; i++) {
            if (!this._numbers[i] || this._numbers[i].getNumber() != i + 1) {
                return false;
            }
        }
        return true;
    },


    _getNumberByCell: function(cell) {
        return this._numbers[this._getIndexByCell(cell)];
    },

    _getSiblingCells: function(cell) {
        var siblings = [];
        if (cell[0] > 0) {
            siblings.push([cell[0] - 1, cell[1]]);
        }
        if (cell[1] < 3) {
            siblings.push([cell[0], cell[1] + 1]);
        }
        if (cell[0] < 3) {
            siblings.push([cell[0] + 1, cell[1]]);
        }
        if (cell[1] > 0) {
            siblings.push([cell[0], cell[1] - 1]);
        }
        return siblings;
    },

    _getIndexByCell: function(cell) {
        return cell[0] * 4 + cell[1];
    },

    _getCellByNumber: function(number) {
        for (var i = 0; i < this._numbers.length; i++) {
            if (this._numbers[i] == number) {
                return [Math.floor(i / 4), i % 4];
            }
        }
    },

    _findEmptyCell: function() {
        for (var i = 0; i < this._numbers.length; i++) {
            if (!this._numbers[i]) {
                return [Math.floor(i / 4), i % 4];
            }
        }
    },


    TagGame_Field__onNumberClick: function(evt) {
        if (!this._shuffling) {
            this.move(this._getCellByNumber(evt.target));
        }
    }
});