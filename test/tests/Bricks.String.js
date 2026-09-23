(function() {
    //#imports
    describe('Bricks.String', function() {

        describe('trim', function() {
            it('удаляет пробельные символы с обоих концов', function() {
                assert.equal(Bricks.String.trim('  x  '), 'x');
                assert.equal(Bricks.String.trim('\t x\n'), 'x');
            });
            it('строка без пробелов не меняется', function() {
                assert.equal(Bricks.String.trim('x'), 'x');
                assert.equal(Bricks.String.trim('a b'), 'a b');
            });
        });

        describe('truncate', function() {
            it('строка короче length — без изменений', function() {
                assert.equal(Bricks.String.truncate('abc', 10), 'abc');
                assert.equal(Bricks.String.truncate('abc', 3), 'abc');
            });
            it('обрезает в центре (чётный остаток length − truncation)', function() {
                // median = floor((5-3)/2) = 1 → 1 + 3 + 1 = 5 = length.
                assert.equal(Bricks.String.truncate('abcdefgh', 5), 'a...h');
            });
            it('собственная строка truncation', function() {
                assert.equal(Bricks.String.truncate('abcdefgh', 4, '>>'), 'a>>h');
            });
            it('quirk (зафиксирован, не фиксится): нечётный остаток length − truncation даёт длину length−1', function() {
                // median = Math.floor((10-3)/2) = 3 → 3 + 3 + 3 = 9, а не 10.
                var result = Bricks.String.truncate('abcdefghijkl', 10, '...');
                assert.equal(result, 'abc...jkl');
                assert.equal(result.length, 9);
            });
        });

        describe('truncateLeft', function() {
            it('строка короче length — без изменений', function() {
                assert.equal(Bricks.String.truncateLeft('abc', 10), 'abc');
            });
            it('обрезает слева', function() {
                assert.equal(Bricks.String.truncateLeft('abcdefgh', 5), '...gh');
            });
            it('собственная строка truncation', function() {
                assert.equal(Bricks.String.truncateLeft('abcdefgh', 5, '>>'), '>>fgh');
            });
        });

        describe('truncateRight', function() {
            it('строка короче length — без изменений', function() {
                assert.equal(Bricks.String.truncateRight('abc', 10), 'abc');
            });
            it('обрезает справа', function() {
                assert.equal(Bricks.String.truncateRight('abcdefgh', 5), 'ab...');
            });
            it('собственная строка truncation', function() {
                assert.equal(Bricks.String.truncateRight('abcdefgh', 4, '>>'), 'ab>>');
            });
        });

        describe('stripTags', function() {
            it('удаляет теги, текст остаётся', function() {
                assert.equal(Bricks.String.stripTags('<b>hi</b> <i>there</i>'), 'hi there');
                assert.equal(Bricks.String.stripTags('<div><span>x</span></div>'), 'x');
                assert.equal(Bricks.String.stripTags('<a href="#">link</a>'), 'link');
            });
            it('строка без тегов не меняется', function() {
                assert.equal(Bricks.String.stripTags('plain text'), 'plain text');
            });
        });

        describe('escapeHTML', function() {
            it('экранирует & " < >', function() {
                assert.equal(Bricks.String.escapeHTML('a & b "q" <x> > y'), 'a &amp; b &quot;q&quot; &lt;x&gt; &gt; y');
            });
            it('ввод превращается в строку', function() {
                assert.equal(Bricks.String.escapeHTML(5), '5');
            });
        });

        describe('camelize / uncamelize', function() {
            it('dash-style → camelStyle', function() {
                assert.equal(Bricks.String.camelize('foo-bar-baz'), 'fooBarBaz');
                assert.equal(Bricks.String.camelize('background-color'), 'backgroundColor');
                assert.equal(Bricks.String.camelize('no-dashes'), 'noDashes');
            });
            it('camelStyle → camel-case-style', function() {
                assert.equal(Bricks.String.uncamelize('fooBarBaz'), 'foo-bar-baz');
                assert.equal(Bricks.String.uncamelize('backgroundColor'), 'background-color');
                assert.equal(Bricks.String.uncamelize('plain'), 'plain');
            });
        });

        describe('format', function() {
            // lib индексирует аргументы 0-based: ${0} — первый аргумент после шаблона.
            it('подставляет ${n} аргументами', function() {
                assert.equal(Bricks.String.format('${0} - ${1}', 'a', 'b'), 'a - b');
            });
            it('экранированный \\${n} не подставляется', function() {
                assert.equal(Bricks.String.format('\\${0}', 'x'), '${0}');
            });
            it('отсутствующий аргумент — пустая строка', function() {
                assert.equal(Bricks.String.format('${0} ${1}', 'a'), 'a ');
            });
            it('повторяющийся номер подставляется многократно', function() {
                assert.equal(Bricks.String.format('${0}-${0}', 'x'), 'x-x');
            });
        });

        describe('times', function() {
            it('повторяет строку', function() {
                assert.equal(Bricks.String.times('ab', 3), 'ababab');
                assert.equal(Bricks.String.times('ab', 1), 'ab');
                assert.equal(Bricks.String.times('ab', 0), '');
            });
        });

        describe('startsWith / endsWith', function() {
            it('startsWith', function() {
                assert.ok(Bricks.String.startsWith('foobar', 'foo'));
                assert.ok(!Bricks.String.startsWith('foobar', 'bar'));
                assert.ok(Bricks.String.startsWith('foo', 'foo'));
            });
            it('endsWith', function() {
                assert.ok(Bricks.String.endsWith('foobar', 'bar'));
                assert.ok(!Bricks.String.endsWith('foobar', 'foo'));
                // баг (батч 1): раньше `>` вместо `>=` — строка == search давала false
                assert.ok(Bricks.String.endsWith('abc', 'abc'));
                assert.ok(Bricks.String.endsWith('abc', ''));
            });
        });

        describe('compile', function() {
            it('<%= %> экранирует HTML', function() {
                var fn = Bricks.String.compile('x<%= this.name %>y');
                assert.equal(fn.call({name: '<b>&"</b>'}), 'x&lt;b&gt;&amp;&quot;&lt;/b&gt;y');
            });

            it('<%&= %> не экранирует', function() {
                var fn = Bricks.String.compile('<%&= this.html %>');
                assert.equal(fn.call({html: '<b>bold</b>'}), '<b>bold</b>');
            });

            it('текст вне тегов выводится как есть, включая unicode', function() {
                var fn = Bricks.String.compile('Привет, <%= this.name %>!');
                assert.equal(fn.call({name: 'мир'}), 'Привет, мир!');
            });

            it('<% %> — произвольный JS-код в контексте this', function() {
                var fn = Bricks.String.compile('<% for (var i = 0; i < this.items.length; i++) { %><%= this.items[i] %><% } %>');
                assert.equal(fn.call({items: ['a', 'b', 'c']}), 'abc');
            });

            it('результат — строка', function() {
                var fn = Bricks.String.compile('a<%= this.n %>b');
                var result = fn.call({n: 5});
                assert.equal(typeof result, 'string');
                assert.equal(result, 'a5b');
            });
        });
    });
})();
