//#require Bricks.create

Bricks.Images = Bricks.create({
    constructor: function() {
        this._images = {};
    },

    get: function(string, path) {
        if (arguments.length == 1) {
            return this._images[string] || '';
        }
        return string.replace('%s', this._images[path] || '');
    },

    add: function(path, content) {
        this._images[path] = content;
    }
});
