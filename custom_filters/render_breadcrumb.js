"use strict";

/** Render breadcrumb */
module.exports = function (env) {
    env.addFilter('render_breadcrumb', function (breadcrumbs) {
        let html = '';
        for (let i in breadcrumbs) {
            if (breadcrumbs.hasOwnProperty(i)) {
                let bread = breadcrumbs[i];
                html += '<li class="'
                + (i == breadcrumbs.length - 1 ? 'active' : '') + '"><a href="' + (bread.href != undefined ? bread.href : '#')
                + '">' + (bread.icon != undefined ? '<i class="' + bread.icon + '"></i>' : '')
                + (bread.title) + '</a></li>';
            }
        }
        return html;
    });
};
