(function() {
    //#imports
    describe('Bricks.Sound (реальный DOM)', function() {
        // Sound — синглтон с doc = реальным документом. Аудиоветка доступна
        // во всех современных браузерах; innerHTML-парсер — механизм (ADR 0003) —
        // тесты работают только в реальном браузере (Yaxy).
        // bgsound-ветка (IE8–10) в современных браузерах отсутствует — не
        // проверяется; play() не вызывается: без реального файла src это
        // отклонённый Promise, а не проверяемое поведение.

        it('isSupported — элемент audio с src', function() {
            assert.ok(Bricks.Sound.isSupported());
        });

        it('_createAudioEl: элемент в документе, три source', function() {
            Bricks.Sound.preload('bricksTestSoundA');
            var audio = document.body.querySelector('audio');
            assert.ok(audio, 'audio-элемент в body');
            assert.strictEqual(audio.parentNode, document.body);
            assert.equal(audio.getAttribute('preload'), 'auto');
            var sources = audio.getElementsByTagName('source');
            assert.equal(sources.length, 3);
            assert.equal(sources[0].getAttribute('src'), 'bricksTestSoundA.ogg');
            assert.equal(sources[1].getAttribute('src'), 'bricksTestSoundA.mp3');
            assert.equal(sources[2].getAttribute('src'), 'bricksTestSoundA.wav');
            assert.equal(sources[0].getAttribute('type'), 'audio/ogg');
            document.body.removeChild(audio);
        });

        it('кэш: два preload с одним именем — один элемент', function() {
            Bricks.Sound.preload('bricksTestSoundB');
            Bricks.Sound.preload('bricksTestSoundB');
            var audios = document.body.querySelectorAll('audio');
            assert.equal(audios.length, 1);
            document.body.removeChild(audios[0]);
        });
    });
})();
