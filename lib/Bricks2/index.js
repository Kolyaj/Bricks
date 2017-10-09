var Bricks2 = {};

//#label mixin
Bricks2.mixin = function(dst) {
    if (dst === undefined || dst === null) {
        throw new TypeError('Cannot convert first argument to object');
    }

    dst = Object(dst);
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
            for (var prop in arguments[i]) {
                if (arguments[i].hasOwnProperty(prop) && typeof arguments[i][prop] !== 'undefined') {
                    dst[prop] = arguments[i][prop];
                }
            }
        }
    }
    return dst;
};
//#endlabel mixin
