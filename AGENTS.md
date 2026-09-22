# Bricks

npm-пакет `dresscode-bricks` — базовая класс-библиотека методологии DressCodeJS (npm: dresscodejs). `Bricks.inherit`/`create` — фундамент, на котором строятся остальные библиотеки экосистемы (Quantum, Botex, …).

## Знания

- `lib/.dresscode` содержит `.` — библиотека самодостаточна: потребитель объявляет путь `node_modules/dresscode-bricks/lib` в своём `.dresscode`.
- Собственной сборки нет: код собирает потребитель через dresscodejs. Код — ES5 с русскими JSDoc-комментариями.
- Legacy-модули `Widget`/`AbstractWidget`/`StringWidget` (UI) и `XHR`/`Request` помечены `@deprecated` (2026-09): актуальный network-модуль — `Remote`; `lib/lang/` (полифиллы) из пакета удалён.
- Публичные модули не удаляются — строгая обратная совместимость: потребитель, обновивший библиотеку ради нового модуля, не должен ничего потерять. Сборщик DressCode кладёт в бандл только используемый код, поэтому неиспользуемые deprecated-модули бесплатны; `@deprecated` — конечное состояние модуля.
- `DOM.normalizeCSSProperty(name, value, el)` без el имплицитно детектит фичи через `document.documentElement.style` — скрытая browser-зависимость (её же без el вызывает `StringWidget._setStyle`).
- `_createXHRObject` (`window.XMLHttpRequest ? … : ActiveXObject`) продублирован в трёх местах: XHR.js, Request.js, Remote.js.
- Тесты: `npm test` — Node-харнесс `test/node/run.js` (ADR 0003, основной): компилирует `test/tests/*.js` in-process через API dresscodejs (эквивалент `-d`), оборачивает бандл CJS-фабрикой со стандартной инъекцией (`BricksTest`, `window`, `document`, `location`, `ActiveXObject`, `setTimeout`/`clearTimeout` = fake-часы, `describe`, `it`, `assert`); весь сьюит — два прохода, sloppy + strict (`'use strict'` в теле фабрики); known-red гейт — тег `[bug <todo-id>]` в заголовке it, реестр `test/node/known-bugs.js`; fake-часы на `BricksTest.clock`; браузерные профили — plain JS в `test/profile/` (в Node `require`, в браузере один `<script>`). Браузерная часть — Yaxy + `test/index.html` (mocha/sinon/jQuery из `test/external/`), остаточный минимум.
- dresscodejs 2.0.8 не выдаёт `'use strict'` нигде (0 вёрст в lib/); CLI `-d` = `--debug` (не обфусцирует private-имена) — бандлы non-strict по умолчанию. Тело функции, созданной `new Function`, non-strict по спецификации в любом контексте: `arguments.callee` в сгенерированном коде (`Bricks.String.compile`) работает и в strict-бандле (стрик-эксперимент 2026-09); реальный strict-баг — `Bricks.Function.throttle` (callee в обычном IIFE — throw).
- Тест `Bricks.rand` — единственный статистический в сьюите: порог 400 откалиброван под 10000 выбросов (измеренный максимум разброса 330) — ложных красных нет; не сужать порог без замера распределения (200 даёт флейк ~2.8%).
- `//#imports` (без аргументов) в тест-файлах разворачивается внутрь IIFE теста → скомпилированный `test/tests/X.js` — самодостаточный скрипт (импорты + тест).
- `EventsController.on` — `fn.call(ctx, evt || window.event)`: событие может прийти через глобал (IE6–8) — ещё одна нормализующая ветка.
- `Number.pluralIndex`: `//#if lang_ru`/`//#if lang_en` — в сборке без `--set lang_*` `index` не присваивается, `plural` вернёт `undefined`; потребитель (и наши тестовые сборки) обязан ставить lang-флаг.
- `docs/adr/` — 0001 «публичные модули не удаляются», 0002 «deprecated не тестируются», 0003 «тесты против браузерных профилей» (полные тексты с trade-off; базис для архитектурных review).
- Релизы — вручную: git-лог показывает коммиты «release 0.x.y»; `package.json` содержит только `dresscodejs` в devDependencies.

