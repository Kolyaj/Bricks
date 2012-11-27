//#include index.js::

Bricks.JSON = {};

//#label parse
Bricks.JSON.parse = function(json) {
    return window.JSON ? JSON.parse(json) : new Function('return ' + json)();
};
//#endlabel parse
