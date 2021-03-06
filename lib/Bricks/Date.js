Bricks.Date = {};

/**
 * Клонирует объект даты date.
 *
 * @param {Date} date
 *
 * @return {Date}
 */
Bricks.Date.clone = function(date) {
    return new Date(date.getTime());
};

/**
 * Возвращает true, если год даты date високосный, иначе false.
 *
 * @param {Date} date
 *
 * @return {Boolean}
 */
Bricks.Date.isLeapYear = function(date) {
    var year = date.getFullYear();
    return Boolean((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
};

/**
 * Возвращает количество дней в месяце даты date.
 *
 * @param {Date} date
 *
 * @return {Number}
 */
Bricks.Date.getDaysInMonth = function(date) {
    var m = date.getMonth();
    return m === 1 && Bricks.Date.isLeapYear(date) ? 29 : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
};

/**
 * Обнуляет значения часов, минут, секунд и миллисекунд у даты date.
 *
 * @param {Date} date
 *
 * @return {Date} Параметр date
 */
Bricks.Date.clearTime = function(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

/**
 * Возвращает номер дня в году, начиная с 0.
 *
 * @param {Date} date
 *
 * @return {Number}
 */
Bricks.Date.getDayOfYear = function(date) {
    var daysInMonth = [31, Bricks.Date.isLeapYear(date) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var num = 0;
    for (var i = 0, m = date.getMonth(); i < m; i++) {
        num += daysInMonth[i];
    }
    return num + this.getDate() - 1;
};

/**
 * Возвращает разницу с временем по Гринвичу в часах (первые две цифры) и минутах (вторые две цифры)
 *
 * @param {Date} date
 * @param {Boolean} [colon] Если передано true, то часы и минуты будут разделены двоеточием.
 *
 * @return {String}
 */
Bricks.Date.getGMTOffset = function(date, colon) {
    var pad = function(n) {
        return (n < 10 ? '0' : '') + n;
    };
    return (date.getTimezoneOffset() > 0 ? "-" : "+") +
        pad(Math.floor(Math.abs(date.getTimezoneOffset()) / 60)) +
        (colon ? ':' : '') +
        pad(Math.abs(date.getTimezoneOffset() % 60));
};


/**
 * Возвращает номер недели в году. Аналогично спецификатору W метода {@link Bricks.Date.format}, но без ведущего нуля.
 *
 * @param {Date} date
 *
 * @return {Number} Число от 1 до 53.
 */
Bricks.Date.getWeekOfYear = function(date) {
    // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
    var ms1d = 864.0e5; // milliseconds in a day
    var ms7d = 7 * ms1d; // milliseconds in a week
    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d; // an Absolute Day Number
    var AWN = Math.floor(DC3 / 7); // an Absolute Week Number
    var Wyr = new Date(AWN * ms7d).getUTCFullYear();
    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
};

//#label format
Bricks.Date._formatters = {};
Bricks.Date._symbols = {
    a: 'd.getHours()<12?"am":"pm"',
    A: 'd.getHours()<12?"AM":"PM"',
    c: '{Y}+"-"+pad({n})+"-"+pad({j})+"T"+pad({G})+":"+{i}+":"+{s}+D.getGMTOffset(d,true)',
    d: 'pad({j})',
    D: '["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]',
    F: '["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]',
    g: 'd.getHours()%12||12',
    G: 'd.getHours()',
    h: 'pad({g})',
    H: 'pad({G})',
    i: 'pad(d.getMinutes())',
    j: 'd.getDate()',
    l: '["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]',
    L: 'D.isLeapYear(d)?1:0',
    m: 'pad({n})',
    M: '["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]',
    n: 'd.getMonth()+1',
    O: 'D.getGMTOffset(d)',
    r: '{D}+", "+{d}+" "+{M}+" "+{Y}+" "+{H}+":"+{i}+":"+{s}+" "+{O}',
    s: 'pad(d.getSeconds())',
    S: '["st","nd","rd"][{1:0,21:0,31:0,2:1,22:1,3:2,23:2}[{j}]]||"th"',
    t: 'D.getDaysInMonth(d)',
    U: 'Math.floor(d.getTime()/1e3)',
    w: 'd.getDay()',
    W: 'pad(D.getWeekOfYear(d))',
    y: 'd.getFullYear()%100',
    Y: 'd.getFullYear()',
    z: 'D.getDayOfYear(d)',
    Z: '-60*d.getTimezoneOffset()'
};
(function(symbols) {
    for (var i in symbols) {
        if (symbols.hasOwnProperty(i)) {
            symbols[i] = symbols[i].replace(/{([a-z])}/ig, function(match, symbol) {
                return symbols[symbol] || match;
            });
        }
    }
})(Bricks.Date._symbols);

/**
 * Возвращает date, отформатированную в соответствии с аргументом fm.
 *
 * @param {Date} date Форматируемая дата.
 * @param {String} fm Строка формата, в которой распознаются следующие символы
 *  a -- Ante meridiem или Post meridiem в нижнем регистре (am или pm)
 *  A -- Ante meridiem или Post meridiem в верхнем регистре (AM или PM)
 *  c -- Дата в формате ISO 8601 (например: 2004-02-12T15:19:21+00:00)
 *  d -- День месяца, 2 цифры с ведущими нулями (от 01 до 31)
 *  D -- Сокращенное наименование дня недели, 3 символа (от Mon до Sun)
 *  F -- Полное наименование месяца, например January или March (от January до December)
 *  g -- Часы в 12-часовом формате без ведущих нулей (От 1 до 12)
 *  G -- Часы в 24-часовом формате без ведущих нулей (От 0 до 23)
 *  h -- Часы в 12-часовом формате с ведущими нулями (От 01 до 12)
 *  H -- Часы в 24-часовом формате с ведущими нулями (От 00 до 23)
 *  i -- Минуты с ведущими нулями (от 00 до 59)
 *  j -- День месяца без ведущих нулей (От 1 до 31)
 *  l (строчная 'L') -- Полное наименование дня недели (От Sunday до Saturday)
 *  L -- Признак високосного года (1, если год високосный, иначе 0)
 *  m -- Порядковый номер месяца с ведущими нулями (От 01 до 12)
 *  M -- Сокращенное наименование месяца, 3 символа (От Jan до Dec)
 *  n -- Порядковый номер месяца без ведущих нулей (От 1 до 12)
 *  O -- Разница с временем по Гринвичу в часах (Например: +0200)
 *  r -- Дата в формате <a href="http://www.faqs.org/rfcs/rfc2822">RFC 2822</a> (Например: Thu, 21 Dec 2000 16:01:07 +0200)
 *  s -- Секунды с ведущими нулями (От 00 до 59)
 *  S -- Английский суффикс порядкового числительного дня месяца, 2 символа (st, nd, rd или th. Применяется совместно с j)
 *  t -- Количество дней в месяце (От 28 до 31)
 *  U -- Количество секунд, прошедших с начала Эпохи Unix (The Unix Epoch, 1 января 1970, 00:00:00 GMT)
 *  w -- Порядковый номер дня недели (От 0 (воскресенье) до 6 (суббота))
 *  W -- Порядковый номер недели года по ISO-8601, первый день недели - понедельник
 *  Y -- Порядковый номер года, 4 цифры (Примеры: 1999, 2003)
 *  y -- Номер года, 2 цифры (Примеры: 99, 03)
 *  z -- Порядковый номер дня в году (нумерация с 0) (От 0 до 365)
 *  Z -- Смещение временной зоны в секундах. Для временных зон западнее UTC это отрицательное число, восточнее UTC - положительное. (От -43200 до 43200)
 * Любые другие символы, встреченные в строке format, будут выведены в результирующую строку без изменений.
 * Избежать распознавания символа как форматирующего можно, если экранировать этот символ с помощью \, при этом
 * сам \ в строке тоже надо экранировать, т.о. фактически нужно ставить два символа \.
 *
 * @return {String} Строка с отформатированным датой/временем.
 */
Bricks.Date.format = function(date, fm) {
    var pad = function(n) {
        return (n < 10 ? '0' : '') + n;
    };

    if (!Bricks.Date._formatters[fm]) {
        var escaping = false;
        Bricks.Date._formatters[fm] = new Function('d,D', 'var pad=' + pad.toString() + ';return""' + fm.replace(/./g, function(symbol) {
            if (symbol === '\\') {
                escaping = !escaping;
                return escaping ? '' : '+"\\\\"';
            }
            if (escaping || !Bricks.Date._symbols[symbol]) {
                escaping = false;
                return '+"' + symbol + '"';
            } else {
                return '+(' + Bricks.Date._symbols[symbol] + ')';
            }
        }));
    }
    return Bricks.Date._formatters[fm](date, Bricks.Date);
};
//#endlabel format
