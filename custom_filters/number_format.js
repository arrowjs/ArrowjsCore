"use strict"
/**
 * Created by thanhnv on 2/28/15.
 */
//format currency to Viet Nam currency
let config = require(__base + 'config/config');
module.exports = function (env) {
    env.addFilter('number_format', function (value) {
        let format = config.number_format;
        let c = format.length
        let d = format.decimal
        let t = format.thousand;
        let n = value;
        c = isNaN(c = Math.abs(c)) ? 2 : c;
        d = d == undefined ? "." : d;
        t = t == undefined ? "," : t;
        let s = n < 0 ? "-" : "";
        let i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
        let j;
        j = (j = i.length) > 3 ? j % 3 : 0;
        return format.header + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "") + format.footer;
    });
}
