Bricks.JSON = {};

Bricks.JSON.parse = function(json) {
    return window.JSON ? JSON.parse(json) : new Function('return ' + json)();
};
