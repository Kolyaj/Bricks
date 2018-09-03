(function() {
    //#require Bricks.Widget
    describe('Bricks.Widget', function() {
        var Widget = Bricks.Widget.inherit({
            _initComponent: function() {
                Widget.superclass._initComponent.apply(this, arguments);
                this.check();
            }
        });

        it('_getEl without arguments returns root element', function() {
            new Widget({
                check: function() {
                    assert.equal(this._getEl(), this._el);
                }
            });
        });
        it('_getEl returns inner element', function() {
            new Widget({
                html: '<div class="foo"></div><div class="bar"></div>',
                check: function() {
                    assert.equal(this._getEl('foo'), this._el.firstChild);
                }
            });
        });
        it('_getEl returns inner svg element', function() {
            new Widget({
                html: '<svg class="svg"></svg>',
                check: function() {
                    if (this._el.firstChild) {
                        assert.equal(this._getEl('svg'), this._el.firstChild);
                    }
                }
            });
        });
        it('_getEls returns many inner elements', function() {
            new Widget({
                html: '<div class="foo"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>',
                check: function() {
                    var bars = this._getEls('bar');
                    assert.equal(bars.length, 3);
                    assert.equal(bars[0], this._el.firstChild.nextSibling);
                    assert.equal(bars[1], this._el.firstChild.nextSibling.nextSibling);
                    assert.equal(bars[2], this._el.firstChild.nextSibling.nextSibling.nextSibling);
                }
            });
        });
        it('_getEls returns path elements', function() {
            new Widget({
                html: '<svg><path class="path" /><path class="path" /><path class="path" /></svg>',
                check: function() {
                    if (this._el.firstChild) {
                        assert.equal(this._getEls('path').length, 3);
                    }
                }
            });
        });
        it('_getEls returns array', function() {
            new Widget({
                check: function() {
                    assert.equal(Object.prototype.toString.call(this._getEls()), '[object Array]');
                }
            });
        });
    });
})();
