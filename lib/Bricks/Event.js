//#include index.js::base

Bricks.Event = {
    //#label getTarget
    //#include DOM.js::getParent
    /**
     * Возвращает источник события. Если указан selector, то производится проход вверх по дереву в поисках
     * элемента удовлетворяющего селектору. Селектор передается в {@link Bricks.DOM.getParent}.
     *
     * @param {Event} evt Объект события.
     * @param {String} [selector] Строка селектора.
     * @param {Number} [depth] Если указан, то поиск производится не глубже этого значения.
     *
     * @return {Node} Найденный элемент или null, если ничего не найдено.
     */
    getTarget: function(evt, selector, depth) {
        var target = evt.target || evt.srcElement;
        return arguments.length > 1 ? Bricks.DOM.getParent(target, selector, depth, true) : target;
    },
    //#endlabel getTarget

    //#label getPos
    //#include ::getTarget
    //#include DOM.js::getDocumentScroll::getRootElement
    /**
     * Возвращает позицию курсора.
     *
     * @param {Event} evt Объект события.
     *
     * @return {Array} Массив целых чисел вида [left, top].
     */
    getPos: function(evt) {
        var doc = Bricks.Event.getTarget(evt).ownerDocument;
        var scroll = Bricks.DOM.getDocumentScroll(doc);
        var rootElem = Bricks.DOM.getRootElement(doc);
        return [evt.pageX || (evt.clientX + scroll[0] - (rootElem.clientLeft || 0)) || 0,
                evt.pageY || (evt.clientY + scroll[1] - (rootElem.clientTop  || 0)) || 0];
    },
    //#endlabel getPos
    
    //#label stop
    /**
     * Останавливает всплытие события.
     * 
     * @param {Event} evt Объект события.
     */
    stop: function(evt) {
        if (evt.preventDefault) {
            evt.preventDefault();
            evt.stopPropagation();
        } else {
            evt.returnValue = false;
            evt.cancelBubble = true;
        }
    },
    //#endlabel stop

    //#label isLeftClick
    /**
     * Возвращает true, если нажата левая кнопка мыши.
     *
     * @param {Event} evt Объект события.
     *
     * @return {Boolean}
     */
    isLeftClick: function(evt) {
        return (evt.which && evt.which == 1) || (evt.button && evt.button == 1);
    },
    //#endlabel isLeftClick

    '': ''
};