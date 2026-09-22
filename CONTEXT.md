# Bricks

`dresscode-bricks` — фундаментальная класс-библиотека методологии DressCodeJS. Глоссарий.

## Language

### Классификация модулей

**Браузерный нормализатор**:
Публичный API, скрывающий различия браузеров: за единым интерфейсом стоит feature-проверка, и вызывающий код получает одно поведение независимо от того, какой браузер выполняет код.
Примеры: `Bricks.DOM.isAncestor` (`contains` / `compareDocumentPosition` / обход `parentNode`), `Bricks.Event.stop` (`preventDefault` / `returnValue`+`cancelBubble`), `Bricks.DOM.normalizeCSSProperty` (vendor-префиксы, `cssFloat`/`styleFloat`, `filter:Alpha`).
_Avoid_: «полифилл» (полифилл добавляет отсутствующую фичу; нормализатор выбирает среди существующих форм).

**Browser-dependent-модуль**:
Модуль, использующий host-API (`document`, `window`, DOM-дерево, события), но не содержащий нормализующей логики: работает только в реальном браузере.
Примеры: `Bricks.Cookie` (`document.cookie`), `Bricks.Sound._createAudioEl` (`innerHTML`), DOM-дерево-функции (`getEl`, `getEls`, `createFragment`).
_Avoid_: путать с «нормализатор» — browser-dependent-модуль *потребляет* браузер, нормализатор *управляет* различиями между браузерами.

**Чистый модуль**:
Модуль без host-зависимостей, тестируемый в любой среде.
Примеры: `Bricks.String`, `Bricks.Number`, `Bricks.Date`, `Bricks.Rnd`, `Bricks.QueryString`, `Bricks.Array`, `Bricks.Observer`, `Bricks.inherit`/`create`/`mixin`.

**Deprecated-модуль**:
Публичный модуль в конечном состоянии (ADR 0001): остаётся в пакете, не развивается, в новом коде не рекомендуется. Тестовым покрытием не обеспечивается до первого фикса (ADR 0002).
Примеры: `Bricks.Widget`, `Bricks.AbstractWidget`, `Bricks.StringWidget`, `Bricks.XHR`, `Bricks.Request`.

### Тестовая архитектура

**Браузерный профиль**:
Mock-объект host-API в интерфейсной форме одного из браузеров: событие без `preventDefault` (IE8), style без `opacity` (IE6), `window` без `XMLHttpRequest`, событие, доставляемое через `window.event`. Профиль — *вход* нормализатор-теста: один набор тестов × много профилей, за один проход накрываются различия всех браузеров.
_Avoid_: «stub» (stub — подмена одного конкретного объекта; профиль — один из вариантов интерфейса), «jsdom» (jsdom — эмуляция реального браузера; профиль — сконструированный интерфейс).

**Тестовый харнесс**:
Среда запуска тестов. Два харнесса: Node (CJS-фабрика со стандартной инъекцией — ADR 0003, `npm test` — основной) и браузер (Yaxy + `test/index.html` — остаточный минимум: то, что нельзя mock-ать).
