//#include index.js::base

//#if not buildjs
include('index.js');
//#endif

Bricks.String = {
    /**
     * Удаляет пробельные символы из начала и конца строки.
     *
     * @param {String} str
     *
     * @return {String} Копия строки без начальных и конечных пробельных символов.
     */
    trim: function(str) {
        return str.replace(/^\s+|\s+$/g, '');
    },

    //#label truncate
    /**
     * Обрезает строку до длины length в центре. Вместо вырезанного куска вставляет строку truncation.
     *
     * @param {String} str Обрезаемая строка.
     * @param {Number} length Длина результирующей строки.
     * @param {String} [truncation] Строка, добавляемая вместо вырезанной части (по умолчанию '...').
     *
     * @return {String} Обрезанная строка.
     */
    truncate: function(str, length, truncation) {
        if (str.length <= length) {
            return str;
        }
        truncation = truncation || '...';
        var median = Math.floor((length - truncation.length) / 2);
        return str.slice(0, median) + truncation + str.slice(-median);
    },
    //#endlabel truncate

    //#label trimLeft
    /**
     * Обрезает строку до длины length слева. Вместо вырезанного куска вставляет строку truncation.
     *
     * @param {String} str Обрезаемая строка.
     * @param {Number} length Длина результирующей строки.
     * @param {String} [truncation] Строка, добавляемая вместо вырезанной части (по умолчанию '...').
     *
     * @return {String} Обрезанная строка.
     */
    trimLeft: function(str, length, truncation) {
        if (str.length <= length) {
            return str;
        }
        truncation = truncation || '...';
        return truncation + str.slice(truncation.length - length);
    },
    //#endlabel trimLeft

    //#label trimRight
    /**
     * Обрезает строку до длины length справа. Вместо вырезанного куска вставляет строку truncation.
     *
     * @param {String} str Обрезаемая строка.
     * @param {Number} length Длина результирующей строки.
     * @param {String} [truncation] Строка, добавляемая вместо вырезанной части (по умолчанию '...').
     *
     * @return {String} Обрезанная строка.
     */
    trimRight: function(str, length, truncation) {
        if (str.length <= length) {
            return str;
        }
        truncation = truncation || '...';
        return str.slice(0, length - truncation.length) + truncation;
    },
    //#endlabel trimRight

    //#label stripTags
    /**
     * Удаляет HTML-теги из строки.
     *
     * @param {String} str
     *
     * @return {String}
     */
    stripTags: function(str) {
        return str.replace(/<\/?[^>]+>/gi, '');
    },
    //#endlabel stripTags

    //#label escapeHTML
    /**
     * Экранирует HTML-теги в HTML-сущности.
     *
     * @param {String} str
     *
     * @return {String}
     */
    escapeHTML: function(str) {
        var div = document.createElement('DIV');
        var text = document.createTextNode(str);
        div.appendChild(text);
        return div.innerHTML;
    },
    //#endlabel escapeHTML

    //#label camelize
    /**
     * Переводит строки из dash-style в camelStyle.
     *
     * @param {String}
     *
     * @return {String}
     */
    camelize: function(str) {
        return str.replace(/-([a-z])/g, function() {
            return arguments[1].toUpperCase();
        });
    },
    //#endlabel camelize

    //#label uncamelize
    /**
     * Выполняет преобразование, обратное {@link #camelize}, т.е. строку вида camelCaseStyle преобразует в
     * camel-case-style.
     *
     * @param {String} str
     *
     * @return {String}
     */
    uncamelize: function(str) {
        return str.replace(/[A-Z]/g, function(letter) {
            return '-' + letter.toLowerCase();
        });
    },
    //#endlabel uncamelize

    //#label format
    /**
     * Форматирует строку str, заменяя в ней шаблоны вида ${number}, где number -- положительное число, на number + 1
     * по счету аргумент. Если $ экранирован символом \, то замена не производится.
     *
     * @param {String} str
     *
     * @return {String}
     */
    format: function(str) {
        var args = [].slice.call(arguments, 1);
        return str.replace(/(\\)?(\$\{(\d+)\})/g, function(ignore, before, template, index) {
            return before ? template : [args[index]].join('');
        });
    },
    //#endlabel format

    //#label times
    /**
     * Повторяет строку str count раз.
     *
     * @param {String} str Повторяемая строка.
     * @param {Number} count Сколько раз повторить.
     *
     * @return {String}
     */
    times: function(str, count) {
        return new Array(count + 1).join(str);
    },
    //#endlabel times

    //#label startsWith
    /**
     * Проверяет, начинается ли строка str со строки search.
     *
     * @param {String} str
     * @param {String} search
     *
     * @return {Boolean}
     */
    startsWith: function(str, search) {
        return str.indexOf(search) == 0;
    },
    //#endlabel startsWith

    //#label endsWith
    /**
     * Проверяет, заканчивается ли строка str строкой search.
     *
     * @param {String} str
     * @param {String} search
     *
     * @return {Boolean}
     */
    endsWith: function(str, search) {
        return str.length > search.length && str.lastIndexOf(search) == str.length - search.length;
    },
    //#endlabel endsWith

    //#label compile
    //#include ::escapeHTML
    /**
     * Компилирует строку str, содержащую шаблон, в функцию, этот шаблон применяющую к своему контексту.
     * Шаблон понимает три вида тегов:
     *      * <%= Выражение, которое необходимо вывести. HTML теги будут экранированы. %>
     *      * <%&= Выражение, которое необходимо вывести. HTML теги не будут экранироваться. %>
     *      * <% for arrayName as itemName %><% endfor %>
     *      * <% for arrayName as keyName => itemName %><% endfor %>
     *      * <% Произвольный JS-код %>
     * Всё, что находится вне этих тегов, выводится как есть.
     * Переменные в шаблон передаются в контексте вызова результирующей функции.
     * Пример: Bricks.String.compile(str).call({var1: value1, var2: value2});
     *
     * @param {String} str
     *
     * @return {Function}
     */
    compile: function(str) {
        var resultVarName = '$_' + Math.round(Math.random() * 1.0e9);
        var resultBody = ['var ', resultVarName, '=[];'];
        resultBody.push(str.replace(/(<%((&)?=)?(.*?)%>)|([\s\S]+?(?=(<%|$)))/g, function(string, tag, assign, noEscape, tagContent) {
            var replacement;
            if (tag) {
                if (assign) {
                    if (noEscape) {
                        replacement = [resultVarName, '.push(', tagContent, ');'];
                    } else {
                        replacement = [resultVarName, '.push(arguments.callee.escapeHTML(String(', tagContent, ')));'];
                    }
                }
            } else {
                replacement = [resultVarName, '.push("', string.replace(/./g, getCharUnicode), '");'];
            }
            return replacement.join('');
        }));
        resultBody.push('return ', resultVarName, '.join("");');
        var result = new Function(resultBody.join(''));
        result.escapeHTML = Bricks.String.escapeHTML;
        return result;

        function getCharUnicode(ch) {
            var code = ch.charCodeAt(0).toString(16);
            while (code.length < 4) {
                code = '0' + code;
            }
            return '\\u' + code;
        }
    },
    //#endlabel compile

    '': ''
};