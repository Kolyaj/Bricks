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
// Весь сьюит прогоняется дважды: обычный (sloppy) проход, затем стрик-проход —
// харнесс добавляет директиву 'use strict' в начало тела фабрики. По спецификации
// тело функций, сгенерированных через new Function (напр. результат
// Bricks.String.compile), non-strict в обоих проходах.
//
// Known-red гейт: тесты известных багов несут тег [bug <todo-id>] в заголовке it;
// падение тегированного тега из реестра known-bugs.js не роняет exit-code,
// остальные падения роняют.
//
// Использование:
//   npm test                            — весь сьюит, build-флаг lang_ru (дефолт)
//   node test/node/run.js --set lang_en — тот же сьюит, build-флаг lang_en

var path = require('path');
var nodeAssert = require('assert');
var Mocha = require('mocha');
var {DressCode} = require('dresscodejs');

var builtins = require('./builtins');
var knownBugs = require('./known-bugs');
var BricksTest = require('../profile');

var TESTS_DIR = path.join(__dirname, '..', 'tests');

// Файлы, идущие в Node-сьюит. Батчи:
//   0 (todo 20260921-8): spike — Bricks.rand.
var MANIFEST = [
    'Bricks.rand.js'
];

// Стандартный список инъекций (ADR 0003): имена параметров, в порядке.
var INJECTIONS = [
    'BricksTest', 'window', 'document', 'location', 'ActiveXObject',
    'setTimeout', 'clearTimeout', 'describe', 'it', 'assert'
];

// Тег известного бага в заголовке it: [bug <todo-id>].
var BUG_TAG = /\[bug\s+([\w-]+)\]/;


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
if (!usageError) {
    // lang_ru/lang_en взаимоисключающие: при обоих включённых в Number.js
    // вторая ветка молча перебивает первую, и поведение неоднозначно.
    var langFlags = Object.keys(setFlags).filter((k) => k.indexOf('lang_') === 0);
    if (langFlags.length > 1) {
        usageError = `Lang-флаги взаимоисключающие: ${langFlags.join(', ')}. Прогоните сьюит дважды.`;
    }
}

// Контекст компиляции. debug (аналог CLI -d) всегда включён: приватные
// имена не обфусцируются. Без lang-флага Number.pluralIndex не получает
// index, и plural вернёт undefined — поэтому дефолт lang_ru, а явный
// --set его заменяет.
var context = {debug: true, lang_ru: true};
Object.keys(setFlags).forEach((k) => {
    if (k.indexOf('lang_') === 0) {
        Object.keys(context).forEach((existing) => {
            if (existing.indexOf('lang_') === 0 && existing !== k) {
                delete context[existing];
            }
        });
    }
    context[k] = true;
});


// ---------- один проход сьюита ----------

var runPass = function(label, strict) {
    console.log(`\n=== проход: ${label} ===`);

    var mocha = new Mocha();

    // Чистый контекст BDD-интерфейса; изоляция между проходами:
    // новый mocha, новые часы, новые инертные моки.
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
        var code = (strict ? "'use strict';\n" : '') + codeByFile[name];
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
        var failures = [];
        var runner = mocha.run((failCount) => {
            resolve({
                label: label,
                failCount: failCount,
                failures: failures,
                stats: runner.stats
            });
        });
        runner.on('fail', (test) => {
            failures.push(test);
        });
    });
};

// Бандлы, скомпилированные для обоих проходов.
var codeByFile = Object.create(null);


// ---------- main ----------

var main = async function() {
    var dresscode = new DressCode(true, true);
    await Promise.resolve().then(() => {
        return MANIFEST.reduce((chain, name) => {
            return chain
                .then(() => dresscode.compile(path.join(TESTS_DIR, name), context, [], []))
                .then((code) => {
                    codeByFile[name] = code;
                });
        }, Promise.resolve());
    });

    console.log(`\nBuild-флаги: ${Object.keys(context).join(', ')}; файлов в сьюите: ${MANIFEST.length}`);

    var passes = [
        await runPass('sloppy', false),
        await runPass('strict', true)
    ];

    // Known-red гейт.
    var known = 0;
    var unknown = 0;
    passes.forEach((pass) => {
        pass.failures.forEach((test) => {
            var match = BUG_TAG.exec(test.fullTitle());
            if (match && Object.prototype.hasOwnProperty.call(knownBugs, match[1])) {
                known++;
                console.log(`  known-bug ${match[1]}: ${test.fullTitle()}`);
            } else {
                unknown++;
            }
        });
        // Страховка от рассинхрона события 'fail': неучтённые падения — unknown.
        unknown += Math.max(0, pass.failCount - pass.failures.length);
    });

    passes.forEach((pass) => {
        console.log(`\nПроход [${pass.label}]: ${pass.stats.tests} тестов, ${pass.stats.passes} прошло, ${pass.failCount} упало.`);
    });

    if (known) {
        console.log(`\nKnown-red (из known-bugs.js, не влияют на exit-code): ${known}`);
    }
    if (unknown) {
        console.log(`\nFAIL: ${unknown} падений вне known-bugs реестра.`);
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
