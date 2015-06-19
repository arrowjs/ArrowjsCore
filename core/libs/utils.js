'use strict';

let isArray;

/**
 * Strip leading and trailing whitespace from a string.
 * @param  {string} input
 * @return {string} Stripped input.
 */
exports.strip = function (input) {
    return input.replace(/^\s+|\s+$/g, '');
};

/**
 * Test if a string starts with a given prefix.
 * @param  {string} str - String to test against.
 * @param  {string} prefix - Prefix to check for.
 * @return {boolean}
 */
exports.startsWith = function (str, prefix) {
    return str.indexOf(prefix) === 0;
};

/**
 * Test if a string ends with a given suffix.
 * @param  {string} str - String to test against.
 * @param  {string} suffix - Suffix to check for.
 * @return {boolean}
 */
exports.endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Iterate over an array or object.
 * @param  {array|object} obj - Enumerable object.
 * @param  {Function} fn - Callback function executed for each item.
 * @return {array|object} - The original input object.
 */
exports.each = function (obj, fn) {
    let i, l;

    if (isArray(obj)) {
        i = 0;
        l = obj.length;
        for (i; i < l; i += 1) {
            if (fn(obj[i], i, obj) === false) {
                break;
            }
        }
    } else {
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (fn(obj[i], i, obj) === false) {
                    break;
                }
            }
        }
    }

    return obj;
};

/**
 * Test if an object is an Array.
 * @param {object} obj
 * @return {boolean}
 */
exports.isArray = isArray = (Array.hasOwnProperty('isArray')) ? Array.isArray : function (obj) {
    return (obj) ? (typeof obj === 'object' && Object.prototype.toString.call(obj).indexOf() !== -1) : false;
};

/**
 * Test if an object is Empty
 * @param {object} obj
 * @returns {boolean}
 */
exports.isEmptyObject = function (obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

/**
 * Test if an item in an enumerable matches your conditions.
 * @param  {array|object} obj - Enumerable object.
 * @param  {Function} fn - Executed for each item. Return true if your condition is met.
 * @return {boolean}
 */
exports.some = function (obj, fn) {
    let i = 0,
        result,
        l;

    if (isArray(obj)) {
        l = obj.length;

        for (i; i < l; i += 1) {
            result = fn(obj[i], i, obj);
            if (result) {
                break;
            }
        }
    } else {
        exports.each(obj, function (value, index) {
            result = fn(value, index, obj);
            return !(result);
        });
    }
    return !!result;
};

/**
 * Return a new enumerable, mapped by a given iteration function.
 * @param  {object} obj - Enumerable object.
 * @param  {Function} fn - Executed for each item. Return the item to replace the original item with.
 * @return {object} - New mapped object.
 */
exports.map = function (obj, fn) {
    let i = 0,
        result = [],
        l;

    if (isArray(obj)) {
        l = obj.length;
        for (i; i < l; i += 1) {
            result[i] = fn(obj[i], i);
        }
    } else {
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                result[i] = fn(obj[i], i);
            }
        }
    }
    return result;
};

/**
 * Copy all of the properties in the source objects over to the destination object, and return the destination object. It's in-order, so the last source will override properties of the same name in previous arguments.
 * @param {...object} arguments
 * @return {object}
 */
exports.extend = function () {
    let args = arguments,
        target = args[0],
        objs = (args.length > 1) ? Array.prototype.slice.call(args, 1) : [],
        i = 0,
        l = objs.length,
        key,
        obj;

    for (i; i < l; i += 1) {
        obj = objs[i] || {};
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                target[key] = obj[key];
            }
        }
    }
    return target;
};

/**
 * Get all of the keys on an object.
 * @param  {object} obj
 * @return {array}
 */
exports.keys = function (obj) {
    if (Object.keys) {
        return Object.keys(obj);
    }

    return exports.map(obj, function (v, k) {
        return k;
    });
};

/**
 * Throw an error with possible line number and source file.
 * @param  {string} message - Error message
 * @param  {number} [line] - Line number in template.
 * @param  {string} [file] - Template file the error occured in.
 * @throws {Error} No seriously, the point is to throw an error.
 */
exports.throwError = function (message, line, file) {
    if (line) {
        message += ' on line ' + line;
    }

    if (file) {
        message += ' in file ' + file;
    }

    throw new Error(message + '.');
};

/**
 * Strip HTML tags
 * @param {string} input - HTML string need to strip tags
 * @param {string} allowed - Allowed tag will be not stripped
 * @returns {object}
 */
exports.strip_tags = function (input, allowed) {
    allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
        .replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
};

/**
 * Shuffle elements in an array
 * @param {array} array
 * @returns {array}
 */
exports.shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};