//#include index.js::base

//#if not buildjs
include('index.js');
//#endif

Bricks.JSON = {
    parse: function(json) {
        return window.JSON ? JSON.parse(json) : new Function('return ' + json)();
    }
};