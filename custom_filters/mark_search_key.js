"use strict";
/**
 * Created by thanhnv on 2/28/15.
 */

module.exports = function (env) {
    env.addFilter('mark_search_key', function (text, keyword) {
        let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
        keyword = keyword.replace(matchOperatorsRe,  '\\$&');
        let regex = new RegExp('(\\b' + keyword + '\\b)', 'gi');
        return text.replace(regex, "<b style='color: red;'>$1</b>");
    });
};
