Bricks.Number = {};

/**
 * Выбирает из forms нужную форму слова, соответствующую числу num. Например,
 * Bricks.Number.plural(2, 'комментарий|комментария|комментариев') вернет '2&nbsp;комментария'.
 * Для выбора нужной формы использует {@link Bricks.Number.pluralIndex}, которая переопределяется в случае локализации.
 *
 * @param {Number} num Число, определяющее форму
 * @param {String} forms Формы слова, разделенные вертикальной чертой |. Для русского языка первая форма соответствует числу 1, вторая -- числу 2, третья -- числу 5.
 * @param {Boolean} [hideNumber] Если параметр установлен в true, то само число подставляться в результат не будет.
 *
 * @return {String} Число и соответствующая ему форма, разделенные &nbsp;.
 */
Bricks.Number.plural = function(num, forms, hideNumber) {
    return (hideNumber ? '' : num + '\u00a0') + forms.split('|')[Bricks.Number.pluralIndex(num)];
};

/**
 * Возвращает номер формы слова для plural. Для русского языка от 0, 1 или 2. В случае локализации
 * переопределяется под нужный язык.
 * Формулы для многих языков имеются на странице http://translate.sourceforge.net/wiki/l10n/pluralforms
 *
 * @param {Number} n Число, для которого определяется форма.
 *
 * @return {Number} Номер формы.
 */
Bricks.Number.pluralIndex = function(n) {
    if (n < 0) {
        n = -n;
    }
    var index;
    //#if lang_ru
    // noinspection JSUnusedAssignment
    index = (n%10 === 1 && n%100 !== 11 ? 0 : n%10 >= 2 && n%10 <= 4 && (n%100 < 10 || n%100 >= 20) ? 1 : 2);
    //#endif
    //#if lang_en
    index = n === 1 ? 0 : 1;
    //#endif
    return index;
};
