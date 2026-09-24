// Node-тестовый харнесс dresscode-bricks (ADR 0003, основной).
//
// Тест-файлы test/tests/ компилируются in-process через API dresscodejs
// (эквивалент Yaxy-правила .yaxy: `dresscodejs -i <file> -d`), а
// самодостаточный бандл (IIFE, //#imports развёрнут внутрь) оборачивается
// CJS-фабрикой со стандартным списком инъекций:
//     (BricksTest, window, document, location, ActiveXObject,
//      setTimeout, clearTimeout, describe, it, assert)
// Free-переменные бандла резолвятся в параметры; параметр window
// изолирует тест-файлы друг от друга.
//
// Среда запуска = build-флаг языка × стрик-контекст (ADR 0003). Языковые
// ветки lib (Number.pluralIndex: `//#if lang_ru` / `//#if lang_en`) проверяются
// обоими build-флагами: сьюит компилируется дважды (lang_ru и lang_en) и
// прогоняется в каждом языке дважды — обычный (sloppy) проход, затем
// стрик-проход (директива 'use strict' в начале тела фабрики). По спецификации
// тело функций, сгенерированных через new Function (напр. результат
// Bricks.String.compile), non-strict в обоих проходах.
//
// Любое падение роняет exit-code: known-red-механизма нет — баги в lib
// исправляются вместе с созданием тестов (решение 2026-09).
//
// Использование:
//   npm test                             — сьюит × {lang_ru, lang_en} × {sloppy, strict}
//   node test/node/run.js --set lang_en  — сьюит × {lang_en} × {sloppy, strict}

var path = require('path');
var nodeAssert = require('assert');
var Mocha = require('mocha');
var {DressCode} = require('dresscodejs');

var builtins = require('./builtins');
var BricksTest = require('../profile');

var TESTS_DIR = path.join(__dirname, '..', 'tests');

// Файлы, идущие в Node-сьюит. Батчи (ADR 0003):
//   0 (todo 20260921-8): spike — Bricks.rand.
//   1 (todo 20260921-9): чистые модули + перенос существующих браузерных тестов.
//   2 (todo 20260921-10): нормализаторы через браузерные профили
//     (Profiles.el/style/doc/event/xhr) + conformance-meta-тесты профилей.
var MANIFEST = [
    // index: mixin, create/inherit, getPrototypeChain(Values), range, rand, isArray-алиас.
    'Bricks.index.js',
    // Чистые модули
    'Bricks.Array.js',
    'Bricks.String.js',
    'Bricks.Number.js',
    'Bricks.Date.js',
    'Bricks.Rnd.js',
    'Bricks.QueryString.js',
    // Window-зависимые (fake-часы)
    'Bricks.Function.js',
    // События: host-объект события — вход нормализации, формы — инлайновые литералы
    // (общие Profiles.event — батч 2)
    'Bricks.Event.js',
    'Bricks.Observer.js',
    'Bricks.EventsController.js',
    'Bricks.Component.js',
    // DOM-нормализация: class* через браузерные профили элементов (Profiles.el)
    'Bricks.DOM.className.js',
    // Батч 2: профили doc/el/style/event/xhr
    'Bricks.DOM.leaves.js',
    'Bricks.DOM.css.js',
    'Bricks.Sound.js',
    'Bricks.Remote.js',
    'Bricks.DragController.js',
    // Conformance-проверки самих профилей (без вызовов lib)
    'Profiles.js'
];

// Стандартный список инъекций (ADR 0003): имена параметров, в порядке.
var INJECTIONS = [
    'BricksTest', 'window', 'document', 'location', 'ActiveXObject',
    'setTimeout', 'clearTimeout', 'describe', 'it', 'assert'
];

// ---------- build-флаги (dresscodejs --set) ----------

var setFlags = {};
var usageError = null;
var argv = process.argv.slice(2);
for (var i = 0; i < argv.length; i++) {
    if (argv[i] !== '--set' || !argv[i + 1]) {
        usageError = `Неизвестный аргумент: ${argv[i]} (ожидается --set <flag>)`;
        break;
    }
    setFlags[argv[++i]] = true;
}

// Языковые build-флаги: по умолчанию прогоняем оба (lang_ru + lang_en) —
// языковые ветки lib (Number.pluralIndex) различаются по флагу, и один
// флаг покрывает только одну ветку. Явный --set lang_* сужает прогон.
var langs = Object.keys(setFlags).filter((k) => k.indexOf('lang_') === 0);
if (!langs.length) {
    langs = ['lang_ru', 'lang_en'];
}

// Контекст компиляции для одного языка. debug (аналог CLI -d) всегда
// включён: приватные имена не обфусцируются. Без lang-флага
// Number.pluralIndex не получает index, и plural вернёт undefined —
// каждый прогон имеет ровно один lang-флаг.
var makeContext = function(lang) {
    var ctx = {debug: true};
    Object.keys(setFlags).forEach((k) => {
        if (k.indexOf('lang_') !== 0) {
            ctx[k] = true;
        }
    });
    ctx[lang] = true;
    return ctx;
};


// ---------- один проход сьюита ----------

var runPass = function(lang, label, strict) {
    console.log(`\n=== ${lang} / ${label} ===`);

    var mocha = new Mocha();

    // Чистый контекст BDD-интерфейса; изоляция между проходами:
    // новый mocha, новые часы, новые modern-профили.
    var suiteCtx = {};
    mocha.suite.emit('pre-require', suiteCtx, label, mocha);

    var clock = builtins.createClock();
    BricksTest.createClock = builtins.createClock;
    BricksTest.clock = clock;
    var globals = builtins.createBrowserGlobals(clock);

    var args = [
        BricksTest,
        globals.window, globals.document, globals.location, globals.ActiveXObject,
        clock.setTimeout, clock.clearTimeout,
        suiteCtx.describe, suiteCtx.it,
        nodeAssert
    ];

    MANIFEST.forEach((name) => {
        var code = (strict ? "'use strict';\n" : '') + codeByFile[name][lang];
        var factory;
        try {
            factory = new Function(...INJECTIONS, code);
        } catch (err) {
            // Не собралась сама фабрика (синтаксическая ошибка в бандле).
            suiteCtx.it(`загрузка ${name} (фабрика)`, () => {
                throw err;
            });
            return;
        }
        try {
            factory(...args);
        } catch (err) {
            // Файл упал при загрузке — регистрируем красным тестом,
            // чтобы выглядело как падение, а не как тихий skip.
            suiteCtx.it(`загрузка ${name}`, () => {
                throw err;
            });
        }
    });

    return new Promise((resolve) => {
        var runner = mocha.run((failCount) => {
            resolve({
                label: `${lang} / ${label}`,
                failCount: failCount,
                stats: runner.stats
            });
        });
    });
};

// Бандлы, скомпилированные для каждого языка: codeByFile[name][lang].
var codeByFile = Object.create(null);


// ---------- main ----------

var main = async function() {
    var dresscode = new DressCode(true, true);
    MANIFEST.forEach((name) => {
        codeByFile[name] = Object.create(null);
    });
    await Promise.resolve().then(() => {
        return langs.reduce((chain, lang) => {
            return chain.then(() => {
                return MANIFEST.reduce((inner, name) => {
                    return inner
                        .then(() => dresscode.compile(path.join(TESTS_DIR, name), makeContext(lang), [], []))
                        .then((code) => {
                            codeByFile[name][lang] = code;
                        });
                }, Promise.resolve());
            });
        }, Promise.resolve());
    });

    console.log(`\nBuild-флаги: ${langs.join(' + ')}; файлов в сьюите: ${MANIFEST.length}; прогонов: ${langs.length * 2}`);

    var passes = [];
    for (var i = 0; i < langs.length; i++) {
        passes.push(
            await runPass(langs[i], 'sloppy', false),
            await runPass(langs[i], 'strict', true)
        );
    }

    var totalFailed = 0;
    passes.forEach((pass) => {
        console.log(`\nПроход [${pass.label}]: ${pass.stats.tests} тестов, ${pass.stats.passes} прошло, ${pass.failCount} упало.`);
        totalFailed += pass.failCount;
    });

    if (totalFailed) {
        console.log(`\nFAIL: ${totalFailed} падений.`);
        process.exitCode = 1;
    } else {
        console.log('\nOK.');
    }
};

if (usageError) {
    console.error(usageError);
    process.exitCode = 1;
} else {
    main().catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
}
