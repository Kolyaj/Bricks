# Пример использования: игра Пятнашки.

Для иллюстрации того, как использовать `Bricks` создадим игру Пятнашки. В соответствии с концепцией, у нас должен
получиться виджет, который можно будет вставить в любое место страницы или в другой виджет.

Начнём с создания окружения для разработки. Для сборки JS-файлов в один нам понадобится [BuildJS](https://github.com/Kolyaj/BuildJS.git),
а для запуска сборщика -- [NodeJS](http://nodejs.org/). На production сервере всего этого не понадобится, так что
это нужно будет поставить только локально. Ставим сначала NodeJS, сейчас это просто даже под Windows, есть много
статей на эту тему, я тут останавливаться подробно не буду.

Клонируем репозиторий BuildJS, заходим в папку nodejs, там два интересующих нас файла. server.js -- сервер для разработки,
build.js -- сборка из командной строки. Запускаем сервер `node server`, теперь у нас на порту 9595 висит сервер,
собирающий js-файлы. Если мы сделаем запрос http://localhost:9595/path/to/file.js, то на вернётся содержимое файла
/path/to/fild.js и все его зависимости.

Теперь копируем в папку с js-файлами содержимое папки lib репозитория Bricks. Создаём для своих нужд новый namespace
`TagGame`, т.е. рядом с папкой Bricks создаём папку TagGame, в которой создаём файл index.js с содержимым

    var TagGame = {};

Теперь можно приступать к созданию самой игры.

Т.к. сложные виджеты у нас состоят из более простых виджетов, то начинать разработку обычно удобнее как раз с простых.
Мы начнём с игрового поля, назовём его TagGame.Field, находится он будет, соответственно, в файле TagGame/Field.js.

Поле у нас будет состоять из таблицы 4х4, строки и ячейки которой выведем циклами, чтобы не повторять одни и те же теги
в коде.

    //#include index.js
    //#include ../Bricks/Widget.js

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
                '</table>'
    });

Обратите внимание, в начале файла мы подключаем index.js из текущей папки, чтобы у нас была определена переменная
`TagGame` и подключаем Widget.js из папки Bricks, чтобы наследоваться от `Bricks.Widget`. Задаём нашему виджету
правильный `className` и не забываем давать нужный префикс всем css-классам внутри виджета.

Самое время посмотреть, что у нас получилось. Для этого создадим в любом месте файл taggame.html с содержимым

    <!doctype html>
    <html>
    <head>
        <title>Пятнашки</title>
        <style type="text/css">
            body {
                font-family: arial, sans-serif;
                font-size: 13px;
            }
        </style>
        <script type="text/javascript"
                src="http://localhost:9595/path/to/js/TagGame/Field.js"></script>
    </head>
    <body>
    <div id="taggame"></div>
    <script type="text/javascript">
        new TagGame.Field({
            renderTo: 'taggame'
        });
    </script>
    </body>
    </html>

/path/to/js нужно заменить на путь к папке, в которой мы разрабатываем игру. Если теперь открыть эту страницу, мы
увидим сетку 4х4 с серыми границами.

Я больше не буду подробно останавливаться на том, как проверить работоспособность какого-либо виджета, для этого
достаточно подключить файл с виджетом через BuildJS на любую страницу, создать экземпляр виджета, указав, куда его
отрендерить.

Теперь нарисуем числа от 1 до 15. Т.к. они будут по всякому двигаться по полю, разумнее будет сделать отдельный виджет
`TagGame.Number`, принимающий один параметр `number`.

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

        html:   '<%= this.number %>'
    });

Ещё нам необходимо будет отслеживать клик по числу, так что виджет должен генерировать соответстующее событие.

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

Вернёмся к `TagGame.Field`, он при своей инициализации должен создать 15 экземпляров `TagGame.Number` с числами от 1 до 15,
сохранить их у себя в массив и отрендерить в ячейки таблицы. Не забываем в начале файла Field.js подключить файл
Number.js. Метод `_initComponent` у TagGame.Field получается пока таким.

    _initComponent: function() {
        TagGame.Field.superclass._initComponent.apply(this, arguments);

        this._numbers = new Array(16);
        for (var i = 0; i < 15; i++) {
            this._numbers[i] = new TagGame.Number({
                number: i + 1,
                renderTo: this._getEl('tag-game-field__table').rows[Math.floor(i / 4)].cells[i % 4]
            });
        }
    }

Создадим вспомогательный метод `_getIndexByCell`, возвращающий индекс в массиве `this._numbers` по координатам
ячейки.

    _getIndexByCell: function(cell) {
        return cell[0] * 4 + cell[1];
    }

И вспомогательный метод `_getCellByNumber`, по ссылке на экземпляр `TagGame.Number` возвращающий координаты ячейки,
в которой лежит этот экземпляр.

    _getCellByNumber: function(number) {
        for (var i = 0; i < this._numbers.length; i++) {
            if (this._numbers[i] == number) {
                return [Math.floor(i / 4), i % 4];
            }
        }
    }

Теперь нам понадобится метод, возвращающий по координатам ячейки экземпляр виджета `TagName.Number`, лежащий
 в этой ячейке. Метод будет protected, т.к. вне `TagGame.Field` он смысла не имеет. Назовём его `_getNumberByCell`.
Принимать он будет массив из двух элементов, первый -- номер строки, второй -- номер столбца.

    _getNumberByCell: function(cell) {
        return this._numbers[(cell[0] * 4 + cell[1])];
    }

Ещё protected метод, возвращающий возможных соседей ячейки.

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
    }

И, наконец, публичный метод `move`, принимающий координаты ячейки и, если в этой ячейке есть число, передвигающий
это число в свободную ячейку, если она по соседству. Если перемещение было успешным, посылаем событие `move`.

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
                this._fireEvent('move');
            }
        }
    }

Осталось создать обработчик кликов на экземплярах `TagGame.Number`, передвигающий число, на котором кликнули.
И повесить этот обработчик на событие 'click' у `TagGame.Number`.

    TagGame_Field__onNumberClick: function(evt) {
        this.move(this._getCellByNumber(evt.target));
    }

Результирующий код виджета `TagGame.Field`

    //#include index.js
    //#include ../Bricks/Widget.js

    //#include Number.js

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
                    this._fireEvent('move');
                }
            }
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


        TagGame_Field__onNumberClick: function(evt) {
            this.move(this._getCellByNumber(evt.target));
        }
    });

Уже можно играть в пятнашки. Но пока неинтересно, нужно автоматическое перемешивание.

Сделаем метод `shuffle`, принимающий количество случайных ходов, которые необходимо сделать. Добавим немножко анимации,
чтобы было поинтересней, и, т.к. с анимацией функция стала асинхронной, она будет принимать ещё callback-функцию и
конекст её вызова.

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
    }

Обратите внимание на свойство `this._shuffling`, оно равно `true`, если в данный момент происходит перемешивание. Во
время перемешивания не генерируется событие `move` и нет реакции на клики по числам. Инициализацию свойства
 `this._shuffle` я добавил в `_initComponent`, чтобы по беглому взгляду на виджет было понятно, какие protected
 свойства в нём используются. Также была использована функция `Bricks.Function.defer`, поэтому необходимо подключить
 её в начале файла. Результирующий код виджета:

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


Вот теперь точно можно играть, но согласитесь, это ещё не игра. Где же рестарт? Где поздравление с выигрышем? Ну не зря
же мы назвали виджет `TagGame.Field`, сделаем теперь `TagGame.Game`, который и будет игрой. Для начала пусть он
просто создаёт экземпляр виджета `TagGame.Field`.

    //#include index.js
    //#include ../Bricks/Widget.js

    //#include Field.js

    TagGame.Game = Bricks.Widget.inherit({
        className: 'tag-game-game',

        css: {

        },

        html:   '<div class="tag-game-game__field"></div>',

        _initComponent: function() {
            TagGame.Game.superclass._initComponent.apply(this, arguments);
            this._field = new TagGame.Field({
                renderTo: this._getEl('tag-game-game__field')
            });
        }
    });

Не забудьте изменить код инициализации игры в файле taggame.html на вызов `new TagGame.Game()`, а не `new TagGame.Field()`.

Добавим кнопку для перемешивания, а заодно прокинем метод `shuffle` из `TagGame.Field` в `TagGame.Game`.

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
        }
    });

Для полноты картины осталось добавить сигнализацию об успешном раскладе. Мы для этого добавим метод `isComplete` в
`TagGame.Field`

    isComplete: function() {
        for (var i = 0; i < 15; i++) {
            if (!this._numbers[i] || this._numbers[i].getNumber() != i + 1) {
                return false;
            }
        }
        return true;
    }

А виджет `TagGame.Game` научим посылать событие `win`, если очередное передвижение числа привело к выигрышу.

    _initComponent: function() {
        TagGame.Game.superclass._initComponent.apply(this, arguments);
        this._field = new TagGame.Field({
            renderTo: this._getEl('tag-game-game__field')
        });

        this._on('tag-game-game__shuffle', 'click', this.TagGame_Game__onShuffleClick);
        this._on(this._field, 'move', this.TagGame_Game__onMoveNumber);
    },


    TagGame_Game__onMoveNumber: function() {
        if (this._field.isComplete()) {
            this._fireEvent('win');
        }
    }

Подсчёт количества ходов я оставлю для домашнего задания. Его можно сделать как прямо внутри `TagGame.Game` так и
отнаследовавшись от него.

Осталось подготовить наши пятнашки к выкладке на продакшн. Для этого нужно собрать весь код в один файл. Есть как минимум
два подхода. Первый более простой, второй более гибкий. В первом случае мы просто собираем файл TagGame/Game.js и все
его зависимости в один файл.

    node path/to/buildjs/nodejs/build TagGame/Game.js > mytaggame.js

Получим файл mytaggame.js, при подключении которого на странице будут доступны namespace-ы `Bricks` и `TagGame`.
Останется только отрендерить в нужное место виджет `TagGame.Game`.

Во втором случае создадим где-то вне иерархии виджетов файл taggame.js со следующим содержимым

    var Tag = (function() {
        //#include TagGame/Game.js

        return TagGame.Game;
    })();

И именно его после сборки BuildJS-ом подключаем на страницу. В результате в глобальной области видимости останется
 только `Tag`, ссылающаяся на `TagGame.Game`.

Во втором случае после сборки и обфускации GoogleCompiler-ом получился файл размером 14 кб.