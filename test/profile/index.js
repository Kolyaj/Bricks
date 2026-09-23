// Агрегатор браузерных профилей для тестов (ADR 0003).
//
// Временная конвенция (проверяется в ходе батчей): plain-JS файл, который
// работает и как <script> в браузере (global-объект window.BricksTest),
// и как Node require (CJS-модуль).
//
// Профиль — задокументированный интерфейс host-объекта в форме одного из
// браузеров: Profiles.<объект>.<браузер>, напр.
//   Profiles.event.ie8      — событие без preventDefault,
//   Profiles.style.ie6      — style без opacity,
//   Profiles.doc.quirks     — document в quirks-режиме,
//   Profiles.doc.modern     — эталон: document.compatMode === 'CSS1Compat'.
//
// Профили-элементы (батч 1) — фабрики: каждая возвращает НОВЫЙ mock,
// потому что тесты мутируют className. Формы:
//   Profiles.el.modern(className) — классический HTML-элемент с classList
//                                    (IE10+ / все современные браузеры);
//   Profiles.el.legacy(className) — элемент без classList (IE9 и старше) —
//                                    классы читаются/пишутся через строку
//                                    el.className;
//   Profiles.el.svg(className)    — элемент XML-пространства (svg): у него
//                                    className — не строка, а живой объект
//                                    (SVGAnimatedString); значение живёт в
//                                    атрибуте class.
//
// Node-харнесс (test/node/run.js) добавляет к объекту fake-часы:
// BricksTest.createClock / BricksTest.clock.

(function () {
    'use strict';

    var BricksTest = {
        Profiles: {}
    };

    // Живой DOMTokenList поверх el.className: методы читают и пишут свойство.
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

    BricksTest.Profiles.el = {
        modern: function(className) {
            var el = {
                tagName: 'DIV',
                className: className
            };
            el.classList = makeClassList(el);
            return el;
        },
        legacy: function(className) {
            return {
                tagName: 'DIV',
                className: className
            };
        },
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

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BricksTest;
    }
    if (typeof window !== 'undefined' && window !== null) {
        window.BricksTest = BricksTest;
    }
})();