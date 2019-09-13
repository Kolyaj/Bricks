(function() {
    //#imports
    describe('Bricks.DOM.setStyleProperty', function() {
        it('height: 100px', function() {
            var el = document.createElement('div');
            Bricks.DOM.setStyleProperty(el, 'height', '100px');
            document.body.appendChild(el);
            assert.equal(el.offsetHeight, 100);
            document.body.removeChild(el);
        });
        it('height: 100', function() {
            var el = document.createElement('div');
            Bricks.DOM.setStyleProperty(el, 'height', 100);
            document.body.appendChild(el);
            assert.equal(el.offsetHeight, 100);
            document.body.removeChild(el);
        });
        it('width,height: [100, 100]', function() {
            var el = document.createElement('div');
            Bricks.DOM.setStyleProperty(el, 'width,height', [100, 100]);
            document.body.appendChild(el);
            assert.equal(el.offsetWidth, 100);
            assert.equal(el.offsetHeight, 100);
            document.body.removeChild(el);
        });
        it('width,height: [0, 0]', function() {
            var el = document.createElement('div');
            Bricks.DOM.setStyleProperty(el, 'width,height', [0, 0]);
            document.body.appendChild(el);
            assert.equal(el.offsetWidth, 0);
            assert.equal(el.offsetHeight, 0);
            document.body.removeChild(el);
        });
    });
})();
