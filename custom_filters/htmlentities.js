'use strict';
let utils = require(__base + 'libs/utils');
module.exports = function (env) {
    env.addFilter('htmlentities', function (string, quote_style, charset, double_encode) {
        var hash_map = utils.get_html_translation_table('HTML_ENTITIES', quote_style),
            symbol = '';
        string = string == null ? '' : string + '';

        if (!hash_map) {
            return false;
        }

        if (quote_style && quote_style === 'ENT_QUOTES') {
            hash_map["'"] = '&#039;';
        }

        if ( !! double_encode || double_encode == null) {
            for (symbol in hash_map) {
                if (hash_map.hasOwnProperty(symbol)) {
                    string = string.split(symbol)
                        .join(hash_map[symbol]);
                }
            }
        } else {
            string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function(ignore, text, entity) {
                for (symbol in hash_map) {
                    if (hash_map.hasOwnProperty(symbol)) {
                        text = text.split(symbol)
                            .join(hash_map[symbol]);
                    }
                }

                return text + entity;
            });
        }

        return string;
    });
};
