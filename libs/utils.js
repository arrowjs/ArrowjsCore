'use strict'
let isArray;

/**
 * Strip leading and trailing whitespace from a string.
 * @param  {string} input
 * @return {string}       Stripped input.
 */
exports.strip = function (input) {
  return input.replace(/^\s+|\s+$/g, '');
};

/**
 * Test if a string starts with a given prefix.
 * @param  {string} str    String to test against.
 * @param  {string} prefix Prefix to check for.
 * @return {boolean}
 */
exports.startsWith = function (str, prefix) {
  return str.indexOf(prefix) === 0;
};

/**
 * Test if a string ends with a given suffix.
 * @param  {string} str    String to test against.
 * @param  {string} suffix Suffix to check for.
 * @return {boolean}
 */
exports.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Iterate over an array or object.
 * @param  {array|object} obj Enumerable object.
 * @param  {Function}     fn  Callback function executed for each item.
 * @return {array|object}     The original input object.
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
 * @param obj
 * @returns {boolean}
 */
exports.isEmptyObject = function(obj) {

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
 * @param  {array|object}   obj   Enumerable object.
 * @param  {Function}       fn    Executed for each item. Return true if your condition is met.
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
 * @param  {object}   obj Enumerable object.
 * @param  {Function} fn  Executed for each item. Return the item to replace the original item with.
 * @return {object}       New mapped object.
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
 * @param  {string} message Error message
 * @param  {number} [line]  Line number in template.
 * @param  {string} [file]  Template file the error occured in.
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

exports.get_html_translation_table = function(table, quote_style) {
    //  discuss at: http://phpjs.org/functions/get_html_translation_table/
    // original by: Philip Peterson
    //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: noname
    // bugfixed by: Alex
    // bugfixed by: Marco
    // bugfixed by: madipta
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: T.Wild
    // improved by: KELAN
    // improved by: Brett Zamir (http://brett-zamir.me)
    //    input by: Frank Forte
    //    input by: Ratheous
    //        note: It has been decided that we're not going to add global
    //        note: dependencies to php.js, meaning the constants are not
    //        note: real constants, but strings instead. Integers are also supported if someone
    //        note: chooses to create the constants themselves.
    //   example 1: get_html_translation_table('HTML_SPECIALCHARS');
    //   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}

    var entities = {},
        hash_map = {},
        decimal;
    var constMappingTable = {},
        constMappingQuoteStyle = {};
    var useTable = {},
        useQuoteStyle = {};

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS';
    constMappingTable[1] = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';

    useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() :
        'ENT_COMPAT';

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error('Table: ' + useTable + ' not supported');
        // return false;
    }

    entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';

    // ascii decimals to real symbols
    for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
            hash_map[String.fromCharCode(decimal)] = entities[decimal];
        }
    }

    return hash_map;
};

exports.strip_tags = function(input, allowed) {
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

exports.shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

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