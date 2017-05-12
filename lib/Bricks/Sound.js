//#require Bricks.Component

Bricks.Sound = new Bricks.Component({
    doc: document,


    _initComponent: function() {
        this._cache = {};
    },

    preload: function(fname) {
        this._getPlayer(fname);
    },

    play: function(fname) {
        this._getPlayer(fname)();
    },

    isSupported: function() {
        return 'src' in this.doc.createElement('audio') || 'src' in this.doc.createElement('bgsound');
    },


    _getPlayer: function(fname) {
        if (!this._cache[fname]) {
            if ('src' in this.doc.createElement('audio')) {
                var audioEl = this._createAudioEl(fname);
                this._cache[fname] = function() {
                    audioEl.play();
                };
            } else if ('src' in this.doc.createElement('bgsound')) {
                var bgsoundEl = this.doc.createElement('bgsound');
                this.doc.getElementsByTagName('head')[0].appendChild(bgsoundEl);
                this._cache[fname] = function() {
                    bgsoundEl.src = fname + '.mp3';
                };
            } else {
                this._cache[fname] = function() {};
            }
        }
        return this._cache[fname];
    },

    _createAudioEl: function(filename) {
        var audioContainer = this.doc.createElement('div');
        audioContainer.innerHTML = '' +
            '<audio preload="auto">' +
            '<source src="' + filename + '.ogg" type="audio/ogg"></source>' +
            '<source src="' + filename + '.mp3" type="audio/mpeg"></source>' +
            '<source src="' + filename + '.wav" type="audio/wav"></source>' +
            '</audio>';
        var audioEl = audioContainer.firstChild;
        this.doc.body.appendChild(audioEl);
        return audioEl;
    }
});
