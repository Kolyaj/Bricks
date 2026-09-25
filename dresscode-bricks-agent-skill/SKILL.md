---
name: dresscode-bricks-agent-skill
display-name: Bricks (dresscode-bricks)
description: "Use when using the dresscode-bricks library (npm: dresscode-bricks, object Bricks) in a DressCodeJS project: Bricks.inherit, Component, Remote, Sound, DOM, Number.plural, deprecated modules. Использовать при работе с классами библиотеки Bricks."
---

# Bricks (dresscode-bricks)

`dresscode-bricks` — фундаментальная класс-библиотека методологии DressCodeJS: корневой объект `Bricks` с классами и утилитами. Собственной сборки нет: код компилируется вместе с вашим кодом dresscodejs (код библиотеки — ES5, JSDoc на русском). О самом сборщике — в скилле dresscode-agent-skill.

## Подключение к проекту

1. `npm install --save-dev dresscode-bricks`
2. В `.dresscode` проекта одна строка:

```
node_modules/dresscode-bricks/lib
```

Библиотека самодостаточна: `lib/.dresscode` содержит `.` — потребитель просто объявляет путь.

Сборщик кладёт в бандл только реально упомянутые в коде модули (транзитивно, вместе с их зависимостями). Невостребованный модуль — в том числе deprecated — в бандл не попадает. Модули в пакете бесплатны, но **упоминаемый** deprecated-модуль будет стоить по размеру — в новом коде их не используйте.

## Классы: построение и наследование

```js
var Thing = Bricks.inherit({          // унаследоваться от Object; то же: Bricks.create({...})
    constructor: function(config) {
        this.name = config.name;
    }
});

var SpecialThing = Thing.inherit({    // унаследоваться от класса
    constructor: function(config) {
        SpecialThing.superclass.constructor.apply(this, arguments);  // ← вызов родителя
        // …
    }
});

var thing = new Thing({name: 'foo'}); // config-хэш → свойства экземпляра
```

Правила:

- **Родитель вызывается через `superclass`, а не по имени**: `MyClass.superclass.method.apply(this, arguments)`. `superclass` указывает на прототип родителя и живёт на конструкторе — при вставке промежуточного класса в цепочку искать-менять ничего не нужно.
- **У инстанса** (например синглтон `Bricks.Sound`) `superclass` отсутствует — вызов со стороны инстанса: `this.constructor.prototype.method.apply(this, arguments)`.
- `Bricks.Component` — базовый класс для config: конструктор принимает хэш; свойства класса — значения по умолчанию экземпляра, значения из config их переопределяют. Инициализация — в переопределяемом `_initComponent()` (базовый вызов на первой строке); разбор — в `destroy()` (базовый вызов — обязательно).
- `Bricks.Observer` — базовый класс событий: `addEventListener(name, fn)`, `removeEventListener(name, fn)`, `_fireEvent(name, data)` — `data` расширяет объект события; подписчики вызываются **в обратном порядке** подписки; ошибка в одном обработчике не останавливает остальных — она передаётся в `_handleListenerError`.
- `Bricks.mixin(dst, src1, …)` — копирует собственные свойства (обратная совместимость: нет `Object.assign`).

## Каталог классов

| Класс | Назначение |
|---|---|
| `Bricks.Observer` | Эмиттер событий: строковые имена, жёсткого списка событий нет. |
| `Bricks.Component` | Observer + конструктор с config-хэшем, `_initComponent()`, `destroy()`. |
| `Bricks.EventsController` | Управляемые подписки на DOM-события: `on(el, events, fn, ctx)`, `un(el, events, fn, ctx)`, `unAll()`, `pause()`/`resume()`. Обработчик получает нормализованное событие (`evt \|\| window.event` — IE6–8): пишите `(event) => …`-подобный код с первым аргументом-событием. |
| `Bricks.DragController` | Перетаскивание элемента: mouse + touch, генерирует `start`/`move`/`end`; логика перемещения — в подписчиках. Config: `el` (узел или id), `useTouch`. `destroy()` снимает все обработчики. |
| `Bricks.Remote` | Асинхронные HTTP-запросы (см. ниже). |
| `Bricks.Rnd` | Псевдослучайный генератор (Mersenne Twister): `new Bricks.Rnd(seed)`, `random()`, `bool(likelihood)`, `shuffle(array)`, `pick(array, count)`. С фиксированным seed — воспроизводимые последовательности. |
| `Bricks.Sound` | Синглтон воспроизведения звука: `preload(fname)`, `play(fname)`, `isSupported()`. `fname` — имя файла **без расширения** (браузер с `<audio>` пробует `.ogg`/`.mp3`/`.wav`, иначе `bgsound` + `.mp3`). **Не конструктор**: `new Bricks.Sound` невозможно, экземпляр для другого `document` создать нельзя. |

## Модули-утилиты

| Модуль | Что даёт |
|---|---|
| `Bricks.DOM` | `getEl`/`getEls` (id, селектор или узел); className: `add`/`remove`/`set`/`toggle`/`get`, `classNameExists`; `setStyle`; `on`/`un`/`unAll`; `initDrag`; `remove`; `isAncestor`; `getParent`; размеры: `getPos`/`getSize`/`getRealSize`/`getViewportSize`/`getDocumentSize`/`getDocumentScroll`; `createFragment`, `createSelectorFilter`; `normalizeCSSProperty`/`normalizeCSSValue` — vendor-префиксы, `cssFloat`/`styleFloat`, `filter:Alpha`: единое поведение на всех браузерах. |
| `Bricks.Event` | Нормализация событий: `getTarget`, `getPos`, `stop`, `isLeftClick` (одно поведение, включая старые IE). |
| `Bricks.String` | `trim`, `format(str, …args)`, `compile(str)` (шаблон `<%= %>` → функция), `startsWith`/`endsWith`, `escapeHTML`/`stripTags`, `truncate`/`truncateLeft`/`truncateRight`, `times`, `camelize`/`uncamelize`. |
| `Bricks.Number` | `plural(num, 'форма\|форма\|форма', hideNumber)`, `pluralIndex(num)` — **зависят от lang-флага** (см. Нюансы); `pad2(n)` — ведущий ноль для < 10. |
| `Bricks.Date` | `format(date, fmt)`, `frmt(date, fmt)` — упрощённый формат (только спецификаторы `d H i m s Y`), `clone`, `clearTime`, `getDayOfYear`, `getWeekOfYear`, `getDaysInMonth`, `isLeapYear`, `getGMTOffset`. |
| `Bricks.Array` | `last`, `isArray`, `flatten(input, depth)`, `include`, `pick`, `shuffle` — последние два на `Math.random` (недетерминированы). |
| `Bricks.Cookie` | `readCookie(name)`, `createCookie(name, value, days, domain)`, `eraseCookie(name)` — только `document.cookie`. |
| `Bricks.QueryString` | `parse(query)`, `stringify(object)`. |
| `Bricks.Function` | `bind(fn, ctx, …args)`, `defer`, `debounce`, `throttle`. |

## Remote — HTTP-запросы

Актуальный network-модуль. Паттерн — класс-сервис с config на цепочке прототипов:

```js
var Remote = Bricks.Remote.inherit({
    getParams:  {app: 'myapp'},        // → URL всех запросов
    postParams: {csrf: '…'},           // → тело POST/PUT
    headers:    {'X-App': 'myapp'},
    contentType: 'application/x-www-form-urlencoded'   // тело
});
var remote = new Remote();

remote.get('/items', {page: 2}, function(response, xhr) { /* response — разобранный ответ */ });
remote.post('/item', {id: 1}, function(response, xhr) { /* … */ });
remote.request(method, url, getParams, postParams, headers, callback, ctx);
```

- Базовые значения берутся из config класса и **целой цепочки прототипов** (наследник добавляет свои) — типичный способ делать классы-сервисы API.
- Per-call аргументы слияются поверх базовых: при конфликте выигрывает значение этого вызова (для `headers` — то же).
- `setGetParam(name, value)`, `setPostParam(name, value)`, `setHeader(name, value)` — задают значения на уровне экземпляра.

## Deprecated-модули (конечное состояние)

В новом коде не использовать:

| Модуль | Вместо него |
|---|---|
| `Bricks.Widget`, `Bricks.AbstractWidget`, `Bricks.StringWidget` | UI — в dresscode-botex (`Botex`) |
| `Bricks.Request`, `Bricks.XHR` | `Bricks.Remote` |
| `Bricks.JSON.parse` | `JSON.parse` |
| `Bricks.isArray` | `Bricks.Array.isArray` |

Публичные модули **никогда не удаляются** (строгая обратная совместимость): обновление пакета ничего не сломает. Но сборщик кладёт в бандл лишь упомянутое, поэтому новый код, ссылающийся на deprecated, тянет его в сборку.

## Нюансы

- **lang-флаг**: `Number.plural`/`pluralIndex` собраны через `//#if lang_ru` / `//#if lang_en`. Потребитель обязан ставить флаг при сборке (`dresscodejs --set lang_ru`); в сборке без флага `plural` вернёт `undefined`.
- **Недетерминированность**: `Bricks.rand(start, end)`, `Array.shuffle`/`pick` используют `Math.random`; воспроизводимые последовательности — только через `Bricks.Rnd` с фиксированным seed.
- **`DOM.normalizeCSSProperty(name, value)` без `el`** детектит фичи через `document.documentElement.style` — скрытая браузерная зависимость: вне браузера не работает.
- **Обработчики с `this`** всегда получайте с явным ctx: в non-strict-бандле `fn.call(undefined)` даёт контекст `window` (ошибки такого рода молча пишут в глобалы).
- dresscodejs не вставляет `'use strict'` в сборки; `Bricks.String.compile` при этом работает и в strict-коде (тело сгенерированной функции non-strict по спецификации) — шаблоны можно использовать без оговорок.
