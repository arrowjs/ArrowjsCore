'use strict';

let utils = require(__base + 'libs/utils');
module.exports = function (env) {
    env.addFilter('html_entity_decode', function (string, quote_style) {
        var hash_map = {},
            symbol = '',
            tmp_str = '',
            entity = '';
        tmp_str = string.toString();

        if (false === (hash_map = utils.get_html_translation_table('HTML_ENTITIES', quote_style))) {
            return false;
        }

        // fix &amp; problem
        // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
        delete(hash_map['&']);
        hash_map['&'] = '&amp;';

        for (symbol in hash_map) {
            entity = hash_map[symbol];
            tmp_str = tmp_str.split(entity)
                .join(symbol);
        }
        tmp_str = tmp_str.split('&#039;')
            .join("'");

        return tmp_str;
    });
};
