'use strict';

let utils = require(__base + 'libs/utils');
let config = require(__base + 'config/config');

module.exports = function (env) {
    env.addFilter('get_seo_info', function (seo_info) {
        if (!seo_info || utils.isEmptyObject(seo_info)) {
            seo_info = {
                meta_title: config.app.title || 'ArrowJs',
                meta_keywords: config.app.keywords || 'arrowjs',
                meta_description: config.app.description || 'An opensource framework written in Javascript'
            };

            if (this.ctx.title) seo_info.meta_title = this.ctx.title;
            if (this.ctx.keyword) seo_info.meta_keywords = this.ctx.keyword;

            if (this.ctx.description) {
                let func1 = env.getFilter('strip_tags');
                let func2 = env.getFilter('truncate');
                seo_info.meta_description = func2(func1(this.ctx.description), 155);
            }
        }

        let func = env.getFilter('safe');
        let html = '<title>' + seo_info.meta_title + '</title>\n' +
            '<meta name="keywords" content="' + seo_info.meta_keywords + '">\n' +
            '<meta name="description" content="' + seo_info.meta_description + '">';

        return func(html);
    });
};