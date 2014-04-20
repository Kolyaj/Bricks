//#include index.js

/**
 * @see https://gist.github.com/banksean/300494
 * @see http://ru.wikipedia.org/wiki/%C2%E8%F5%F0%FC_%CC%E5%F0%F1%E5%ED%ED%E0
 *
 * @type {Function}
 */
Bricks.Rnd = Bricks.create({
    MAX_INT: 9007199254740992,

    MIN_INT: -9007199254740992,

    N: 624,

    M: 397,

    MATRIX_A: 0x9908b0df,  // constant vector a

    UPPER_MASK: 0x80000000,  // most significant w-r bits

    LOWER_MASK: 0x7fffffff,  // least significant r bits

    constructor: function(seed) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        this._mt = new Array(this.N); // the array for the state vector
        this._mti = this.N + 1; // _mti==N+1 means _mt[N] is not initialized

        this.init(seed);
    },

    init: function(seed) {
        this._mt[0] = seed >>> 0;
        for (this._mti = 1; this._mti < this.N; this._mti++) {
            var s = this._mt[this._mti - 1] ^ (this._mt[this._mti - 1] >>> 30);
            this._mt[this._mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this._mti;
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect */
            /* only MSBs of the array _mt[]. */
            /* 2002/01/09 modified by Makoto Matsumoto */
            this._mt[this._mti] >>>= 0;
            /* for >32 bit machines */
        }
    },

    initByArray: function(initKey, keyLength) {
        this.init(19650218);
        var i = 1;
        var j = 0;

        var k = (this.N > keyLength ? this.N : keyLength);
        for (; k; k--) {
            var s = this._mt[i - 1] ^ (this._mt[i - 1] >>> 30);
            this._mt[i] = (this._mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + initKey[j] + j; // non linear
            this._mt[i] >>>= 0; // for WORDSIZE > 32 machines
            i++;
            j++;
            if (i >= this.N) {
                this._mt[0] = this._mt[this.N - 1];
                i = 1;
            }
            if (j >= keyLength) {
                j = 0;
            }
        }
        for (k = this.N - 1; k; k--) {
            var t = this._mt[i - 1] ^ (this._mt[i - 1] >>> 30);
            this._mt[i] = (this._mt[i] ^ (((((t & 0xffff0000) >>> 16) * 1566083941) << 16) + (t & 0x0000ffff) * 1566083941)) - i; // non linear
            this._mt[i] >>>= 0; // for WORDSIZE > 32 machines
            i++;
            if (i >= this.N) {
                this._mt[0] = this._mt[this.N - 1];
                i = 1;
            }
        }

        this._mt[0] = 0x80000000; // MSB is 1; assuring non-zero initial array
    },

    int32: function() {
        var y;
        var mag01 = [0x0, this.MATRIX_A];
        /* mag01[x] = x * MATRIX_A for x=0,1 */

        if (this._mti >= this.N) { // generate N words at one time
            var kk;

            if (this._mti == this.N + 1) {
                // if init_genrand() has not been called, a default initial seed is used
                this.init(5489);
            }

            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this._mt[kk] & this.UPPER_MASK) | (this._mt[kk + 1] & this.LOWER_MASK);
                this._mt[kk] = this._mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this._mt[kk] & this.UPPER_MASK) | (this._mt[kk + 1] & this.LOWER_MASK);
                this._mt[kk] = this._mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this._mt[this.N - 1] & this.UPPER_MASK) | (this._mt[0] & this.LOWER_MASK);
            this._mt[this.N - 1] = this._mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

            this._mti = 0;
        }

        y = this._mt[this._mti++];

        /* Tempering */
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);

        return y >>> 0;
    },

    real1: function() {
        return this.int32() * (1.0 / 4294967295.0);
    },

    real2: function() {
        return this.int32() * (1.0 / 4294967296.0);
    },

    real3: function() {
        return (this.int32() + 0.5) * (1.0 / 4294967296.0);
    },

    random: function() {
        return this.real2();
    }
});

//#label bool
Bricks.Rnd.prototype.bool = function(likelihood) {
    likelihood = likelihood || 50;
    if (likelihood < 0 || likelihood > 100) {
        throw new RangeError('Likelihood accepts values from 0 to 100.');
    }
    return this.random() * 100 < likelihood;
};
//#endlabel bool

//#label natural
Bricks.Rnd.prototype.natural = function(min, max) {
    if (arguments.length == 0) {
        max = this.MAX_INT;
        min = 0;
    } else if (arguments.length == 1) {
        max = min;
        min = 0;
    }
    if (min < 0) {
        throw new RangeError('min cannot be lesser than 0.');
    }
    if (min > max) {
        throw new RangeError('min cannot be greater than max.');
    }

    return Math.floor(this.random() * (max - min + 1) + min);
};
//#endlabel natural

//#label integer
//#include ::natural::bool
Bricks.Rnd.prototype.integer = function(min, max) {
    if (arguments.length == 0) {
        min = this.MIN_INT;
        max = this.MAX_INT;
    } else if (arguments.length == 1) {
        max = min;
        min = 0;
    }
    if (min > max) {
        throw new RangeError('min cannot be greater than max.');
    }


    // Greatest of absolute value of either max or min so we know we're
    // including the entire search domain.
    var range = Math.max(Math.abs(min), Math.abs(max));

    // Probably a better way to do this...
    do {
        var num = this.natural(range) * (this.bool() ? 1 : -1);
    } while (num < min || num > max);

    return num;
};
//#endlabel integer

//#label shuffle
//#include ::natural
Bricks.Rnd.prototype.shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var num = this.natural(i - 1);
        var d = array[num];
        array[num] = array[i];
        array[i] = d;
    }
    return array;
};
//#endlabel shuffle

//#label pick
//#include ::natural::shuffle
Bricks.Rnd.prototype.pick = function(array, count) {
    count = count || 1;
    if (count == 1) {
        return array[this.natural(array.length - 1)];
    } else {
        return this.shuffle(array.slice(0)).slice(0, count)
    }
};
//#endlabel pick
