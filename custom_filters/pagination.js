"use strict";

/** Create pagination */
module.exports = function (env) {
    env.addFilter('pagination', function (totalPage, current_page, link) {
        link = link.replace(/\"(.*)\"\.\"(.*)\"/, '$1.$2');

        if (totalPage > 1) {
            let start = parseInt(current_page) - 4;
            if (start < 1) {
                start = 1;
            }

            let end = parseInt(current_page) + 4;
            if (end > totalPage) {
                end = totalPage;
            }

            let html = '<div class="col-md-12">' +
                '<div class="dataTables_paginate paging_simple_numbers" id="sample_2_paginate">' +
                '<ul class="pagination pull-left">' +
                '<li class="paginate_button previous ' + (parseInt(current_page) == 1 ? "disabled" : "") + '" aria-controls="sample_2" tabindex="0" id="sample_2_previous">' +
                '<a class="page-link" href="' + (parseInt(current_page) == 1 ? "#" : link.replace('{page}', parseInt(current_page) - 1)) + '"><i class="fa fa-angle-left"></i></a></li>';

            if (start > 1) {
                let url = link.replace('{page}', start - 1);
                html += '<li class="paginate_button" aria-controls="sample_2" tabindex="0"><a class="page-link" href="' + url + '">...</a></li>'
            }

            for (let i = start; i <= end; i++) {
                let url = link.replace('{page}', i);
                let active = parseInt(current_page) == i ? "active" : "";
                html += '<li class="paginate_button ' + active + '" aria-controls="sample_2" tabindex="0"><a class="page-link" href="' + url + '">' + i + '</a></li>'
            }

            if (end < totalPage) {
                let url = link.replace('{page}', end + 1);
                html += '<li class="paginate_button" aria-controls="sample_2" tabindex="0"><a class="page-link" href="' + url + '">...</a></li>'
            }
            html += '<li class="paginate_button next ' + (current_page == totalPage ? 'disabled' : '') + '" aria-controls="sample_2" tabindex="0" id="sample_2_next"><a class="page-link" href="' + (parseInt(current_page) == totalPage ? "#" : link.replace('{page}', parseInt(current_page) + 1)) + '"><i class="fa fa-angle-right"></i></a></li>' +
            '</ul></div></div>';

            return html;
        } else {
            return '';
        }
    });
};
