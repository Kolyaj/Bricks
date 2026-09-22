// Агрегатор браузерных профилей для тестов (ADR 0003; наполняется батчем 2).
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
// Node-харнесс (test/node/run.js) добавляет к объекту fake-часы:
// BricksTest.createClock / BricksTest.clock.

(function () {
    'use strict';

    var BricksTest = {
        Profiles: {}
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BricksTest;
    }
    if (typeof window !== 'undefined' && window !== null) {
        window.BricksTest = BricksTest;
    }
})();
