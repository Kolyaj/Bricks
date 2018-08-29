(function() {
    //#require Bricks.DOM.removeClassName
    describe('Bricks.DOM.removeClassName', function() {
        it('remove class from div element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<div class="height_100"></div>';
            document.body.appendChild(container);
            assert.equal(container.firstChild.offsetHeight, 100);
            Bricks.DOM.removeClassName(container.firstChild, 'height_100');
            assert.notEqual(container.firstChild.offsetHeight, 100);
            document.body.removeChild(container);
        });
        it('remove class from div element with two classes', function() {
            var container = document.createElement('div');
            container.innerHTML = '<div class="height_100 width_100"></div>';
            document.body.appendChild(container);
            assert.equal(container.firstChild.offsetHeight, 100);
            assert.equal(container.firstChild.offsetWidth, 100);
            Bricks.DOM.removeClassName(container.firstChild, 'height_100');
            assert.notEqual(container.firstChild.offsetHeight, 100);
            assert.equal(container.firstChild.offsetWidth, 100);
            Bricks.DOM.removeClassName(container.firstChild, 'width_100');
            assert.notEqual(container.firstChild.offsetHeight, 100);
            assert.notEqual(container.firstChild.offsetWidth, 100);
            document.body.removeChild(container);
        });
        it('remove class from svg element', function() {
            var container = document.createElement('div');
            container.innerHTML = '<svg class="height_100"></svg>';
            document.body.appendChild(container);
            if (container.firstChild) {
                // В старых IE SVG не очень-то работает, там и не проверяем
                var rect1 = container.firstChild.getBoundingClientRect();
                assert.equal(rect1.bottom - rect1.top, 100);
                Bricks.DOM.removeClassName(container.firstChild, 'height_100');
                var rect2 = container.firstChild.getBoundingClientRect();
                assert.notEqual(rect2.bottom - rect2.top, 100);
                document.body.removeChild(container);
            }
        });
    });
})();
