# Bricks

npm-пакет `dresscode-bricks` — базовая класс-библиотека методологии DressCodeJS (npm: dresscodejs). `Bricks.inherit`/`create` — фундамент, на котором строятся остальные библиотеки экосистемы (Quantum, Botex, …).

## Знания

- `lib/.dresscode` содержит `.` — библиотека самодостаточна: потребитель объявляет путь `node_modules/dresscode-bricks/lib` в своём `.dresscode`.
- Собственной сборки нет: код собирает потребитель через dresscodejs. Код — ES5 с русскими JSDoc-комментариями.
- Legacy-модули `Widget`/`AbstractWidget`/`StringWidget` (UI) и `XHR`/`Request` помечены `@deprecated` (2026-09): актуальный network-модуль — `Remote`; `lib/lang/` (полифиллы) из пакета удалён.
- Публичные модули не удаляются — строгая обратная совместимость: потребитель, обновивший библиотеку ради нового модуля, не должен ничего потерять. Сборщик DressCode кладёт в бандл только используемый код, поэтому неиспользуемые deprecated-модули бесплатны; `@deprecated` — конечное состояние модуля.
- `DOM.normalizeCSSProperty(name, value, el)` без el имплицитно детектит фичи через `document.documentElement.style` — скрытая browser-зависимость (её же без el вызывает `StringWidget._setStyle`).
- `_createXHRObject` (`window.XMLHttpRequest ? … : ActiveXObject`) продублирован в трёх местах: XHR.js, Request.js, Remote.js.
- Тесты запускаются только в браузере через Yaxy: правило в `.yaxy` компилирует каждый запрос `/tests/X.js` через `dresscodejs -d` (сборка на лету); `test/index.html` грузит все тесты и запускает mocha (mocha/sinon/jQuery из `test/external/`). Npm-скриптов нет.
- Релизы — вручную: git-лог показывает коммиты «release 0.x.y»; `package.json` содержит только `dresscodejs` в devDependencies.
- `docs/adr/0001-no-public-module-removal.md` — полный текст политики «публичные модули не удаляются» с trade-off; базис для отказа от предложений удаления в архитектурных review.
