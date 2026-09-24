// Агрегатор браузерных профилей для тестов (ADR 0003).
//
// Временная конвенция (проверяется в ходе батчей): plain-JS файл, который
// работает и как <script> в браузере (global-объект window.BricksTest),
// и как Node require (CJS-модуль).
//
// Профиль — задокументированный интерфейс host-объекта в форме одного из
// браузеров: Profiles.<объект>.<браузер>, напр.
//   Profiles.el.legacy     — элемент без classList (IE9 и старше);
//   Profiles.style.ie8     — style без opacity (IE6-8);
//   Profiles.doc.quirks    — document в quirks-режиме (compatMode 'BackCompat');
//   Profiles.doc.modern    — эталон: document.compatMode === 'CSS1Compat';
//   Profiles.event.ie8     — событие без preventDefault (srcElement, clientX).
//
// Профили — фабрики: каждая возвращает НОВЫЙ объект, потому что тесты его
// мутируют. Аргумент фабрики — задокументированное состояние интерфейса
// (className, scroll, координаты), а не его форма.
//
// Группы:
//   el    — DOM-элемент. Ось class* (батч 1): modern (classList), legacy
//           (без classList, IE9-), svg (XML-пространство: className — объект).
//           Структурная ось (батч 2): modern — contains + getBoundingClientRect,
//           legacy — compareDocumentPosition + getBoundingClientRect (IE8+),
//           ancient — ничего из этого (цепочки parentNode / offsetLeft, IE4-).
//   style — эталон Bricks.DOM.normalizeCSSProperty: набор именованных свойств
//           el.style (проверяется typeof, string = браузер его выдаёт).
//   doc   — document: compat-mode, окно (pageXOffset/innerWidth), скролл,
//           createElement (ось Sound: audio/bgsound), event-синк.
//   event — событие: target/srcElement, pageX/clientX, preventDefault, touches.
//   xhr   — интерфейс XMLHttpRequest (конструктор; нативный vs ActiveXObject —
//           ветка окна, а не самого XHR).
//
// Node-харнесс (test/node/run.js) добавляет к объекту fake-часы:
// BricksTest.createClock / BricksTest.clock. Инжектируемые в сьюит window/
// document — это modern-профили (test/node/builtins.js).

(function () {
    'use strict';

    var BricksTest = {
        Profiles: {}
    };

    // --------------------------------------------------------------------
    // Event-синк (harness-хуки): host-интерфейс addEventListener/
    // removeEventListener + _fire — диспетчер fake-событий для тестов.
    // Регистрация слушателей — интерфейс, не механизм (ADR 0003).
    // --------------------------------------------------------------------
    var makeEventSink = function(obj) {
        obj._handlers = Object.create(null);
        obj.addEventListener = function(name, fn) {
            var list = obj._handlers[name];
            if (!list) {
                list = obj._handlers[name] = [];
            }
            list.push(fn);
        };
        obj.removeEventListener = function(name, fn) {
            var list = obj._handlers[name];
            if (!list) {
                return;
            }
            for (var i = 0; i < list.length; i++) {
                if (list[i] === fn) {
                    list.splice(i, 1);
                    i--;
                }
            }
        };
        // Диспетчер: вызывает всех зарегистрированных на name с evt.
        obj._fire = function(name, evt) {
            var list = obj._handlers[name];
            if (!list) {
                return;
            }
            var copy = list.slice();
            for (var i = 0; i < copy.length; i++) {
                copy[i](evt);
            }
        };
        return obj;
    };

    // --------------------------------------------------------------------
    // Живой DOMTokenList поверх el.className: методы читают и пишут свойство.
    // --------------------------------------------------------------------
    var makeClassList = function(el) {
        var getTokens = function() {
            var tokens = (el.className || '').split(/\s+/);
            if (tokens[0] === '') {
                tokens.shift();
            }
            return tokens;
        };
        return {
            contains: function(name) {
                return getTokens().indexOf(name) !== -1;
            },
            add: function(name) {
                var tokens = getTokens();
                if (tokens.indexOf(name) === -1) {
                    tokens.push(name);
                    el.className = tokens.join(' ');
                }
            },
            remove: function(name) {
                var source = getTokens();
                var tokens = [];
                for (var i = 0; i < source.length; i++) {
                    if (source[i] !== name) {
                        tokens.push(source[i]);
                    }
                }
                el.className = tokens.join(' ');
            }
        };
    };

    // --------------------------------------------------------------------
    // Ветки определения предка, которые реально различают браузеры:
    // contains (IE9+) / compareDocumentPosition (IE4-8) / цепочка parentNode.
    // --------------------------------------------------------------------

    // contains по спецификации: true для самого элемента и его потомков.
    var makeContains = function() {
        return function contains(child) {
            var node = child;
            while (node) {
                if (node === this) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        };
    };

    // compareDocumentPosition по спецификации: биты описывают положение
    // other относительно this: 0 — тот же элемент, 16 (CONTAINED_BY) —
    // other строгий потомок, 8 (CONTAINS) — other строгий предок. Биты
    // порядка 2/4 опущены: lib проверяет только бит 16.
    var makeCompareDocumentPosition = function() {
        return function compareDocumentPosition(child) {
            if (child === this) {
                return 0;
            }
            var node = child;
            while (node) {
                if (node === this) {
                    return 16;
                }
                node = node.parentNode;
            }
            node = this;
            while (node) {
                if (node === child) {
                    return 8;
                }
                node = node.parentNode;
            }
            return 0;
        };
    };

    // --------------------------------------------------------------------
    // Общий структурный каркас HTML-элемента (батч 2).
    // --------------------------------------------------------------------
    var makeEl = function(className, opts, structural) {
        opts = opts || {};
        var el = {
            tagName: 'DIV',
            className: className,
            parentNode: opts.parentNode || null,
            ownerDocument: opts.ownerDocument || null,
            offsetParent: opts.offsetParent || null,
            offsetLeft: opts.offsetLeft || 0,
            offsetTop: opts.offsetTop || 0
        };
        if (structural.contains) {
            el.contains = makeContains();
        }
        if (structural.cdp) {
            el.compareDocumentPosition = makeCompareDocumentPosition();
        }
        if (structural.rect) {
            var rect = opts.rect || {left: 0, top: 0};
            el.getBoundingClientRect = function() {
                return rect;
            };
        }
        return makeEventSink(el);
    };

    // --------------------------------------------------------------------
    // Элементы.
    // --------------------------------------------------------------------
    BricksTest.Profiles.el = {
        // IE10+ / все современные: classList (батч 1) + contains +
        // getBoundingClientRect (батч 2).
        modern: function(className, opts) {
            var el = makeEl(className, opts, {contains: true, rect: true});
            el.classList = makeClassList(el);
            return el;
        },

        // Батч 1: без classList (IE9-). Структурная ось (батч 2): IE4-8 —
        // нет contains, есть compareDocumentPosition, есть
        // getBoundingClientRect (с IE8).
        legacy: function(className, opts) {
            return makeEl(className, opts, {cdp: true, rect: true});
        },

        // До-IE4: нет classList, нет contains, нет compareDocumentPosition,
        // нет getBoundingClientRect — предки через цепочку parentNode,
        // геометрия через offsetLeft/offsetTop.
        ancient: function(className, opts) {
            return makeEl(className, opts, {});
        },

        // Батч 1: XML-пространство (svg): у элемента нет свойства className —
        // это живой объект (SVGAnimatedString); значение живёт в атрибуте.
        svg: function(className) {
            return {
                tagName: 'SVG',
                className: {},
                _attrs: {
                    'class': className
                },
                getAttribute: function(name) {
                    return this._attrs[name];
                },
                setAttribute: function(name, value) {
                    this._attrs[name] = value;
                }
            };
        }
    };

    // --------------------------------------------------------------------
    // Style — эталон normalizeCSSProperty. Нормализатор проверяет наличие
    // именованных свойств через typeof (string = браузер его выдаёт),
    // поэтому у свойств любые строковые значения.
    // --------------------------------------------------------------------
    BricksTest.Profiles.style = {
        // IE10+ / все современные: всё без префиксов.
        modern: function() {
            return {opacity: '', cssFloat: '', display: '', borderRadius: ''};
        },

        // IE6-8: нет opacity (только filter), нет cssFloat (styleFloat),
        // border-radius отсутствует вообще.
        ie8: function() {
            return {styleFloat: '', display: ''};
        },

        // IE10: opacity появился, border-radius/flex — с -ms- префиксом
        // (и с дефисом, и camel: '-ms-borderRadius').
        ie10: function() {
            return {opacity: '', styleFloat: '', display: '', '-ms-flex': '', '-ms-borderRadius': ''};
        },

        // FF 3.6-4: Moz-префикс, без непрефиксированного border-radius.
        moz: function() {
            return {opacity: '', cssFloat: '', display: '', MozBorderRadius: ''};
        },

        // Safari 2-3.1 / ранние Chrome: Webkit-префикс.
        webkit: function() {
            return {opacity: '', cssFloat: '', display: '', WebkitBorderRadius: ''};
        },

        // Opera 10.5-12: O-префикс.
        o: function() {
            return {opacity: '', cssFloat: '', display: '', OBorderRadius: ''};
        }
    };

    // --------------------------------------------------------------------
    // Document. Каждая форма несёт своё окно (окно формы: наличие
    // pageXOffset/innerWidth), compat-mode, носителя скролла и ось Sound
    // (audio/bgsound в createElement).
    // --------------------------------------------------------------------
    var makeDoc = function(form, opts) {
        opts = opts || {};
        var scroll = opts.scroll || [0, 0];

        var win = {};
        if (form.pageXOffset) {
            win.pageXOffset = scroll[0];
            win.pageYOffset = scroll[1];
        }
        if (form.innerWidth) {
            win.innerWidth = opts.innerWidth || 1024;
            win.innerHeight = opts.innerHeight || 768;
        }

        var clientWidth = opts.clientWidth || 1024;
        var clientHeight = opts.clientHeight || 768;
        var makeRoot = function() {
            return {
                clientWidth: clientWidth,
                clientHeight: clientHeight,
                clientLeft: opts.clientLeft || 0,
                clientTop: opts.clientTop || 0,
                scrollLeft: 0,
                scrollTop: 0,
                scrollWidth: opts.scrollWidth || clientWidth,
                scrollHeight: opts.scrollHeight || clientHeight,
                style: opts.style || BricksTest.Profiles.style.modern(),
                parentNode: null,
                _children: [],
                appendChild: function(child) {
                    this._children.push(child);
                }
            };
        };

        var doc = {
            compatMode: form.compatMode,
            documentElement: makeRoot(),
            body: makeRoot(),
            head: {
                _children: [],
                appendChild: function(child) {
                    this._children.push(child);
                }
            },
            createElement: function(tag) {
                var el = {};
                if (tag === 'audio' && form.audio) {
                    el.src = '';
                }
                if (tag === 'bgsound' && form.bgsound) {
                    el.src = '';
                }
                return el;
            },
            getElementsByTagName: function(tag) {
                return tag === 'head' ? [doc.head] : [];
            },
            // В Node-сьюите дерева документов нет: строковый el не
            // передаётся (покрытие getEl строкой — батч 3, Yaxy).
            getElementById: function() {
                return null;
            }
        };

        // Носитель скролла по compat-режиму: в quirks скроллится body,
        // documentElement не скроллится (0 — falsy, цепочка || идёт дальше).
        if (form.scrollOn === 'both' || form.scrollOn === 'documentElement') {
            doc.documentElement.scrollLeft = scroll[0];
            doc.documentElement.scrollTop = scroll[1];
        }
        if (form.scrollOn === 'both' || form.scrollOn === 'body') {
            doc.body.scrollLeft = scroll[0];
            doc.body.scrollTop = scroll[1];
        }

        // Окно:现代ние браузеры — только defaultView; IE — parentWindow
        // (и defaultView; ветка || берёт parentWindow); ранние — только
        // parentWindow.
        if (form.view === 'both') {
            doc.parentWindow = win;
            doc.defaultView = win;
        }
        if (form.view === 'defaultView') {
            doc.defaultView = win;
        }
        if (form.view === 'parentWindow') {
            doc.parentWindow = win;
        }

        return makeEventSink(doc);
    };

    BricksTest.Profiles.doc = {
        // Эталон: standards-режим, окно с pageXOffset и innerWidth, audio.
        modern: function(opts) {
            return makeDoc({
                compatMode: 'CSS1Compat', view: 'defaultView',
                pageXOffset: true, innerWidth: true,
                scrollOn: 'both', audio: true, bgsound: false
            }, opts);
        },

        // IE standards: pageXOffset не было никогда (скролл — на
        // documentElement), innerWidth есть (с IE6), bgsound вместо audio.
        ie: function(opts) {
            return makeDoc({
                compatMode: 'CSS1Compat', view: 'both',
                pageXOffset: false, innerWidth: true,
                scrollOn: 'documentElement', audio: false, bgsound: true
            }, opts);
        },

        // IE quirks: compatMode 'BackCompat' — корень = body, скролл на body.
        quirks: function(opts) {
            return makeDoc({
                compatMode: 'BackCompat', view: 'both',
                pageXOffset: false, innerWidth: true,
                scrollOn: 'body', audio: false, bgsound: true
            }, opts);
        },

        // Ранние браузеры: в окне нет ни pageXOffset, ни innerWidth
        // (window.innerWidth появилось в IE6), звуковых элементов нет.
        ancient: function(opts) {
            return makeDoc({
                compatMode: 'CSS1Compat', view: 'parentWindow',
                pageXOffset: false, innerWidth: false,
                scrollOn: 'documentElement', audio: false, bgsound: false
            }, opts);
        }
    };

    // --------------------------------------------------------------------
    // События. Формы различаются наличием target/srcElement, pageX/clientX,
    // preventDefault, touches.
    // --------------------------------------------------------------------
    BricksTest.Profiles.event = {
        // Современные браузеры (включая mobile): target, pageX/pageY,
        // preventDefault/stopPropagation.
        modern: function(opts) {
            opts = opts || {};
            var evt = {
                type: opts.type || 'click',
                target: opts.target || null,
                clientX: opts.clientX || 0,
                clientY: opts.clientY || 0,
                pageX: opts.pageX || 0,
                pageY: opts.pageY || 0,
                button: 0,
                which: 1,
                preventDefault: function() {
                    evt.defaultPrevented = true;
                },
                stopPropagation: function() {
                    evt.propagationStopped = true;
                }
            };
            return evt;
        },

        // IE8: нет target (srcElement), нет pageX/pageY, нет preventDefault.
        ie8: function(opts) {
            opts = opts || {};
            return {
                type: opts.type || 'click',
                srcElement: opts.target || null,
                clientX: opts.clientX || 0,
                clientY: opts.clientY || 0,
                button: 0
            };
        },

        // Touch-событие: контейнер координат — touches[0].
        touch: function(opts) {
            opts = opts || {};
            var evt = {
                type: opts.type || 'touchstart',
                target: opts.target || null,
                touches: opts.touches || [{clientX: 0, clientY: 0, pageX: 0, pageY: 0}],
                clientX: opts.clientX || 0,
                clientY: opts.clientY || 0,
                pageX: opts.pageX || 0,
                pageY: opts.pageY || 0,
                preventDefault: function() {
                    evt.defaultPrevented = true;
                },
                stopPropagation: function() {
                    evt.propagationStopped = true;
                }
            };
            return evt;
        }
    };

    // --------------------------------------------------------------------
    // XMLHttpRequest — задокументированный интерфейс: open/
    // setRequestHeader/send/getResponseHeader/readyState/status/
    // responseText. При send() запрос «завершается» синхронно
    // (readyState 4) и вызывает onreadystatechange — детерминированно,
    // без fake-часов. Ответ настраивается через Ctor.configure ДО
    // запроса (конфигурация захватывается при конструировании).
    // --------------------------------------------------------------------
    var makeXHR = function(config) {
        var cfg = config || {};
        var respHeaders = Object.create(null);
        var srcHeaders = cfg.responseHeaders || {};
        for (var key in srcHeaders) {
            if (srcHeaders.hasOwnProperty(key)) {
                respHeaders[String(key).toLowerCase()] = srcHeaders[key];
            }
        }
        return {
            readyState: 0,
            status: 0,
            responseText: '',
            onreadystatechange: null,
            _reqHeaders: Object.create(null),
            _respHeaders: respHeaders,
            open: function(method, url, async) {
                this._method = method;
                this._url = url;
                this._async = async;
                this.readyState = 1;
            },
            setRequestHeader: function(name, value) {
                this._reqHeaders[String(name).toLowerCase()] = value;
            },
            getResponseHeader: function(name) {
                var key = String(name).toLowerCase();
                return this._respHeaders[key] || null;
            },
            send: function(body) {
                this._body = body;
                this.readyState = 4;
                this.status = cfg.status != null ? cfg.status : 200;
                this.responseText = cfg.responseText != null ? cfg.responseText : '';
                if (this.onreadystatechange) {
                    this.onreadystatechange();
                }
            }
        };
    };

    var xhrCtor = function() {
        return makeXHR(xhrCtor._config);
    };
    xhrCtor.configure = function(config) {
        xhrCtor._config = config;
    };
    xhrCtor.make = makeXHR;
    // Mock-конструктор ActiveXObject (окно IE5-6): проверяет тип.
    xhrCtor.activex = function(type) {
        if (type !== 'Msxml2.XMLHTTP') {
            throw new Error('unknown ActiveXObject type: ' + type);
        }
        return makeXHR(xhrCtor._config);
    };
    BricksTest.Profiles.xhr = xhrCtor;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BricksTest;
    }
    if (typeof window !== 'undefined' && window !== null) {
        window.BricksTest = BricksTest;
    }
})();
