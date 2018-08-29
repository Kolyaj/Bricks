(function() {
    //#require Bricks.DOM.classNameExists
    describe('Bricks.DOM.classNameExists', function() {
        it('single class of div element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<div class="foo"></div>';
            assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'foo'));
        });
        it('two classes of div element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<div class="foo bar"></div>';
            assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'foo'));
            assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'bar'));
        });
        it('single class of svg element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<svg class="foo"></svg>';
            if (container.firstChild) {
                // В старых IE SVG не очень-то работает, там и не проверяем
                assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'foo'));
            }
        });
        it('two classes of svg element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<svg class="foo bar"></svg>';
            if (container.firstChild) {
                // В старых IE SVG не очень-то работает, там и не проверяем
                assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'foo'));
                assert.ok(Bricks.DOM.classNameExists(container.firstChild, 'bar'));
            }
        });
        it('class of div element after change className', function() {
            var div = document.createElement('div');
            div.className = 'foo';
            assert.ok(Bricks.DOM.classNameExists(div, 'foo'));
        });
    });
})();
