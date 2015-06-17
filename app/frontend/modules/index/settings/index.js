'use strict'

module.exports = function (app, config) {
    let alias = 'index';

    app.route('/_menus/' + alias + '/page/:page').get(function (req, res) {
        if (req.isAuthenticated()) {
            // Send json response
            res.jsonp({
                totalRows: 1,
                totalPage: 1,
                items: [{
                    'title': 'Home Page'
                }],
                title_column: 'title',
                link_template: '/'
            });
        }
        else {
            res.send("Not Authenticated");
        }
    });

    return {
        title: 'Home',
        alias: alias,
        search: false
    };
};
