# Bricks

npm-пакет `dresscode-bricks` — базовая класс-библиотека методологии DressCodeJS (npm: dresscodejs). `Bricks.inherit`/`create` — фундамент, на котором строятся остальные библиотеки экосистемы (Quantum, Botex, …).

## Знания

- `lib/.dresscode` содержит `.` — библиотека самодостаточна: потребитель объявляет путь `node_modules/dresscode-bricks/lib` в своём `.dresscode`.
- Собственной сборки нет: код собирает потребитель через dresscodejs. Код — ES5 с русскими JSDoc-комментариями.
- Legacy-модули `Widget`/`AbstractWidget`/`StringWidget` (UI) и `XHR`/`Request` помечены `@deprecated` (2026-09): актуальный network-модуль — `Remote`; `lib/lang/` (полифиллы) из пакета удалён.
- Публичные модули не удаляются — строгая обратная совместимость: потребитель, обновивший библиотеку ради нового модуля, не должен ничего потерять. Сборщик DressCode кладёт в бандл только используемый код, поэтому неиспользуемые deprecated-модули бесплатны; `@deprecated` — конечное состояние модуля.
- `DOM.normalizeCSSProperty(name, value, el)` без el имплицитно детектит фичи через `document.documentElement.style` — скрытая browser-зависимость (её же без el вызывает `StringWidget._setStyle`).
- `_createXHRObject` (`window.XMLHttpRequest ? … : ActiveXObject`) продублирован в трёх местах: XHR.js, Request.js, Remote.js.
- Тесты: браузерная часть — через Yaxy (правило в `.yaxy` компилирует `/tests/X.js` через `dresscodejs -d`; `test/index.html` грузит тесты, mocha/sinon/jQuery из `test/external/`) и остаётся остаточным минимумом; Node-часть — основная среда (ADR 0003), строится по todo-батчам: mocha + CJS-фабрика вокруг dresscode-бандла, браузерные профили, `npm test`.
- dresscodejs 2.0.8 не выдаёт `'use strict'` нигде (0 вёрст в lib/); CLI `-d` = `--debug` (не обфусцирует private-имена) — бандлы non-strict по умолчанию.
- `//#imports` (без аргументов) в тест-файлах разворачивается внутрь IIFE теста → скомпилированный `test/tests/X.js` — самодостаточный скрипт (импорты + тест).
- `EventsController.on` — `fn.call(ctx, evt || window.event)`: событие может прийти через глобал (IE6–8) — ещё одна нормализующая ветка.
- `Number.pluralIndex`: `//#if lang_ru`/`//#if lang_en` — в сборке без `--set lang_*` `index` не присваивается, `plural` вернёт `undefined`; потребитель (и наши тестовые сборки) обязан ставить lang-флаг.
- `docs/adr/` — 0001 «публичные модули не удаляются», 0002 «deprecated не тестируются», 0003 «тесты против браузерных профилей» (полные тексты с trade-off; базис для архитектурных review).
- Релизы — вручную: git-лог показывает коммиты «release 0.x.y»; `package.json` содержит только `dresscodejs` в devDependencies.

