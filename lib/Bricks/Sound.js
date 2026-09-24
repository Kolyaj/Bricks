/**
 * Синглтон-компонент для воспроизведения звука: кэширует проигрыватель для каждого файла.
 *
 * @type {Bricks.Component}
 */
Bricks.Sound = new Bricks.Component({
    /**
     * @type {Document}
     * Документ, в котором создаются audio-элементы.
     */
    doc: document,


    _initComponent: function() {
        this.constructor.prototype._initComponent.apply(this, arguments);
        this._cache = {};
    },

    /**
     * Предзагружает файл fname, создавая для него проигрыватель.
     *
     * @param {String} fname Имя файла без расширения (пробуются .ogg, .mp3, .wav).
     */
    preload: function(fname) {
        this._getPlayer(fname);
    },

    /**
     * Проигрывает файл fname, при необходимости создавая для него проигрыватель.
     *
     * @param {String} fname Имя файла без расширения.
     */
    play: function(fname) {
        this._getPlayer(fname)();
    },

    /**
     * Возвращает true, если браузер поддерживает воспроизведение звука.
     *
     * @return {Boolean}
     */
    isSupported: function() {
        return 'src' in this.doc.createElement('audio') || 'src' in this.doc.createElement('bgsound');
    },


    /**
     * @param {String} fname Имя файла без расширения.
     *
     * @return {Function} Функция-проигрыватель для файла fname.
     */
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

    /**
     * Создаёт audio-элемент с source-тегами .ogg/.mp3/.wav для файла filename и вставляет его в документ.
     *
     * @param {String} filename Имя файла без расширения.
     *
     * @return {Node} Созданный audio-элемент.
     */
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
