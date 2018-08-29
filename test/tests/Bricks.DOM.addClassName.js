(function() {
    //#require Bricks.DOM.addClassName
    describe('Bricks.DOM.addClassName', function() {
        it('add class name to div element', function() {
            var div = document.createElement('div');
            document.body.appendChild(div);
            Bricks.DOM.addClassName(div, 'height_100');
            assert.equal(div.offsetHeight, 100);
            document.body.removeChild(div);
        });
        it('add class name to div element with existing className', function() {
            var div = document.createElement('div');
            div.className = 'foo bar';
            document.body.appendChild(div);
            Bricks.DOM.addClassName(div, 'height_100');
            assert.equal(div.offsetHeight, 100);
            document.body.removeChild(div);
        });
        it('add two class names to div element', function() {
            var div = document.createElement('div');
            document.body.appendChild(div);
            Bricks.DOM.addClassName(div, 'height_100');
            Bricks.DOM.addClassName(div, 'width_100');
            assert.equal(div.offsetHeight, 100);
            assert.equal(div.offsetWidth, 100);
            document.body.removeChild(div);
        });
        it('add class name to svg element', function() {
            var svg = document.createElement('svg');
            document.body.appendChild(svg);
            Bricks.DOM.addClassName(svg, 'height_100');
            assert.equal(svg.offsetHeight, 100);
            document.body.removeChild(svg);
        });
    });
})();
