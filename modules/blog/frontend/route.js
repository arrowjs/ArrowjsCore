'use strict';

module.exports = function (app) {
    // Root routing
    let post = require('./controllers/post');
    let page = require('./controllers/page');
    //let category = require('./controllers/category');
    //let archives = require('./controllers/archives');
    //let author = require('./controllers/author');
    //let search = require('./controllers/search');

    // Search router
    //app.route('/search/').get(search.index);

    // Categories router
    //app.route('/category/:alias([0-9a-zA-Z-]+)(/)?').get(category.index);
    //app.route('/category/:alias([0-9a-zA-Z-]+)/page-:page([0-9])?(/)?').get(category.index);

    // Author router
    //app.route('/author\/:author([0-9a-zA-Z-]+)(/)?').get(author.index);
    //app.route('/author\/:author([0-9a-zA-Z-]+)/page-:page([0-9])?(/)?').get(author.index);

    // Archive router
    //app.route('/archives\/:year([0-9]{4})\/:month([0-9]{2})\/').get(archives.index);
    //app.route('/archives\/:year([0-9]{4})\/:month([0-9]{2})\/page-:page([0-9])\/').get(archives.index);

    // Page router
    app.route('/:alias([a-zA-Z0-9-]+)(/)?').get(page.index);

    // Post router
    app.route('/:id([0-9]+)/:alias([a-zA-Z0-9-]+)(/)?').get(post.index);
};