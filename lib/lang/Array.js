//#label indexOf
if (!Array.prototype.indexOf) {
    /**
     * Возвращает номер, под которым находится object в массиве, или -1, если object не нашелся.
     * Поиск ведется с начала массива.
     *
     * @param {*} object Искомый объект.
     *
     * @return {Number} Индекс элемента или -1, если не найден.
     */
    Array.prototype.indexOf = function(object) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === object) {
                return i;
            }
        }
        return -1;
    };
}
//#endlabel indexOf

//#label lastIndexOf
if (!Array.prototype.lastIndexOf) {
    /**
     * Возвращает номер, под которым находится object в массиве, или -1, если object не нашелся.
     * Поиск ведется с конца массива.
     *
     * @param {*} object Искомый объект.
     *
     * @return {Number} Индекс элемента или -1, если не найден.
     */
    Array.prototype.lastIndexOf = function(object) {
        for (var i = this.length - 1; i >= 0; i--) {
            if (i in this && this[i] === object) {
                return i;
            }
        }
        return -1;
    };
}
//#endlabel lastIndexOf

//#label forEach
if (!Array.prototype.forEach) {
    /**
     * Перебирает элементы массива и для каждого вызывает fn в контексте ctx. В fn передаются
     * параметры: элемент массива, текущий индекс, ссылка на сам массив.
     *
     * @param {Function} fn Callback-функция.
     * @param {Object} [ctx] Контекст вызова callback-функции.
     */
    Array.prototype.forEach = function(fn, ctx) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this) {
                fn.call(ctx, this[i], i, this);
            }
        }
    };
}
//#endlabel forEach

//#label map
if (!Array.prototype.map) {
    /**
     * Возвращает массив, содержащий элементы исходного массива после обработки функцией fn, вызванной в
     * контексте ctx. Вызов fn аналогичен forEach.
     *
     * @param {Function} fn Callback-функция.
     * @param {Object} [ctx] Контекст вызова callback-функции.
     *
     * @return {Array} Результирующий массив.
     */
    Array.prototype.map = function(fn, ctx) {
        var result = new Array(this.length);
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this) {
                result[i] = fn.call(ctx, this[i], i, this);
            }
        }
        return result;
    };
}
//#endlabel map

//#label filter
if (!Array.prototype.filter) {
    /**
     * Возвращает массив, содержащий только те элементы исходного массива, для которых fn вернула
     * истинное значение. Вызов fn аналогичен forEach.
     *
     * @param {Function} fn Callback-функция.
     * @param {Object} [ctx] Контекст вызова callback-функции.
     *
     * @return {Array} Результирующий массив.
     */
    Array.prototype.filter = function(fn, ctx) {
        var result = [];
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && fn.call(ctx, this[i], i, this)) {
                result.push(this[i]);
            }
        }
        return result;
    };
}
//#endlabel filter

//#label every
if (!Array.prototype.every) {
    /**
     * Возвращает true, если fn для каждого элемента массива вернула истинное значение. Вызов fn
     * аналогичен forEach.
     *
     * @param {Function} fn Callback-функция.
     * @param {Object} [ctx] Контекст вызова callback-функции.
     *
     * @return {Boolean}
     */
    Array.prototype.every = function(fn, ctx) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && !fn.call(ctx, this[i], i, this)) {
                return false;
            }
        }
        return true;
    };
}
//#endlabel every

//#label some
if (!Array.prototype.some) {
    /**
     * Возвращает true, если fn хотя бы для одного элемента массива вернула истинное значение.
     * После первого найденного истинного значения перебор прекращается. Вызов fn аналогичен forEach.
     *
     * @param {Function} fn Callback-функция.
     * @param {Object} [ctx] Контекст вызова callback-функции.
     *
     * @return {Boolean}
     */
    Array.prototype.some = function(fn, ctx) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && fn.call(ctx, this[i], i, this)) {
                return true;
            }
        }
        return false;
    };
}
//#endlabel some

//#label reduce
if (!Array.prototype.reduce) {
    /**
     * Итеративно сводит массив к единственному значению (возможно к другому массиву). Если параметр
     * init не задан, то им становится первый элемент массива (не элемент с индексом 0, а первый
     * элемент). На первой итерации в fn первым параметром передается init, на последующих — результат
     * выполнения на предыдущей итерации. Вторым параметром в fn передается очередной элемент
     * массива. Если init не передан, то перебор, соответственно, начинается со второго элемента.
     * Возвращается результат выполнения функции fn на последней итерации. Если вызывается у пустого
     * массива и не передан init, то бросается исключение TypeError.
     *
     * @param {Function} fn Callback-функция.
     * @param {*} [init] Инициирующее значение.
     *
     * @return {*} Результат последнего вызова fn.
     */
    Array.prototype.reduce = function(fn, init) {
        var i = 0, l = this.length;
        if (arguments.length < 2) {
            if (this.length == 0) {
                throw new TypeError('reduce of empty array with no initial value');
            }
            for (; i < l; i++) {
                if (i in this) {
                    init = this[i];
                    i++;
                    break;
                }
            }
        }
        for (; i < l; i++) {
            if (i in this) {
                init = fn(init, this[i], i, this);
            }
        }
        return init;
    };
}
//#endlabel reduce

//#label reduceRight
if (!Array.prototype.reduceRight) {
    /**
     * То же самое, что reduce, но перебор ведется с конца массива.
     *
     * @param {Function} fn Callback-функция.
     * @param {*} [init] Инициирующее значение.
     *
     * @return {*} Результат последнего вызова fn.
     */
    Array.prototype.reduceRight = function(fn, init) {
        var i = this.length - 1;
        if (arguments.length < 2) {
            if (this.length == 0) {
                throw new TypeError('reduce of empty array with no initial value');
            }
            for (; i >= 0; i--) {
                if (i in this) {
                    init = this[i];
                    i--;
                    break;
                }
            }
        }
        for (; i >= 0; i--) {
            if (i in this) {
                init = fn(init, this[i], i, this);
            }
        }
        return init;
    };
}
//#endlabel reduceRight
