"use strict";
let XRegExp = require('xregexp').XRegExp,
    cheerio = require('cheerio'),
    config = require(__base + 'config/config');

/**
 * Created by vhchung on 4/28/15.
 */

module.exports = function (env) {
    env.addFilter('generate_internal_link', function (text, link_pattern) {
        console.time('A');
        link_pattern = link_pattern || {
                'ios': 'http://techmaster.vn/khoa-hoc/8212/Lap-trinh-iOS-Objective-C',
                'java': 'http://techmaster.vn/khoa-hoc/25475/java-can-ban-lop-thay-hien-viettel',
                'web': 'http://techmaster.vn/khoa-hoc/25466/Nodejs-xay-dung-web-site-toc-do-cao',
                'html5': 'http://techmaster.vn/khoa-hoc/25466/Nodejs-xay-dung-web-site-toc-do-cao',
                'javascript': 'http://techmaster.vn/khoa-hoc/25466/Nodejs-xay-dung-web-site-toc-do-cao',
                'swift': 'http://techmaster.vn/khoa-hoc/8217/Lap-trinh-iOS-Swift',
                'android': 'http://techmaster.vn/khoa-hoc/8219/Lap-trinh-Android'
            };

        for (let i in link_pattern) {
            // #Step 1: wrap matches string by <span> tag with class `auto-internal`
            let regex = new RegExp('(\\b' + i + '\\b)', 'gi');
            text = XRegExp.replaceLb(text, "(?i)(?<!-)(?!-)", regex, '<span class="auto-internal">$1</span>')

        }
        // #Step 2: replace all span tag with class `auto-internal` by anchor tag
        let chee = cheerio.load(text);
        chee('.auto-internal').each(function() {
            // Extra job: Check if parent is an anchor
            if (!chee(this).parent().is('a')) {
                // Replace `.auto-internal` by an anchor tag
                chee(this).replaceWith('<a target="_blank" href="' + link_pattern[chee(this).text().toLowerCase()] + '">' + chee(this).text() + '</a>');
            }
        });
        console.timeEnd('A');
        return chee.html();
    });
};

// Extends XRegExp to use negative lookbehind group in regex pattern (?<!...)
(function (XRegExp) {

    function prepareLb(lb) {
        // Allow mode modifier before lookbehind
        var parts = /^((?:\(\?[\w$]+\))?)\(\?<([=!])([\s\S]*)\)$/.exec(lb);
        return {
            // $(?!\s) allows use of (?m) in lookbehind
            lb: XRegExp(parts ? parts[1] + "(?:" + parts[3] + ")$(?!\\s)" : lb),
            // Positive or negative lookbehind. Use positive if no lookbehind group
            type: parts ? parts[2] === "=" : !parts
        };
    }

    XRegExp.execLb = function (str, lb, regex) {
        var pos = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                return match;
            }
            pos = match.index + 1;
        }
        return null;
    };

    XRegExp.testLb = function (str, lb, regex) {
        return !!XRegExp.execLb(str, lb, regex);
    };

    XRegExp.searchLb = function (str, lb, regex) {
        var match = XRegExp.execLb(str, lb, regex);
        return match ? match.index : -1;
    };

    XRegExp.matchAllLb = function (str, lb, regex) {
        var matches = [], pos = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                matches.push(match[0]);
                pos = match.index + (match[0].length || 1);
            } else {
                pos = match.index + 1;
            }
        }
        return matches;
    };

    XRegExp.replaceLb = function (str, lb, regex, replacement) {
        var output = "", pos = 0, lastEnd = 0, match, leftContext;
        lb = prepareLb(lb);
        while (match = XRegExp.exec(str, regex, pos)) {
            leftContext = str.slice(0, match.index);
            if (lb.type === lb.lb.test(leftContext)) {
                // Doesn't work correctly if lookahead in regex looks outside of the match
                output += str.slice(lastEnd, match.index) + XRegExp.replace(match[0], regex, replacement);
                lastEnd = match.index + match[0].length;
                if (!regex.global) {
                    break;
                }
                pos = match.index + (match[0].length || 1);
            } else {
                pos = match.index + 1;
            }
        }
        return output + str.slice(lastEnd);
    };

}(XRegExp));