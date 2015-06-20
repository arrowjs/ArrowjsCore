'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

let _module = new FrontModule('blog');

_module.index = function (req, res) {
    promise.all(
        [
            // Find post by id
            __models.post.find({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                where: {
                    id: req.params.id,
                    type: 'post',
                    published: 1
                }
            }),
            // Find all categories
            __models.category.findAndCountAll({
                order: "id,parent ASC"
            })
        ]
    ).then(function (results) {
            if (results[0]) {
                // Get SEO info
                let seo_info = null;
                 console.log(results[0].seo_info);
                if (results[0].seo_info && results[0].seo_info.length > 0 )
                    seo_info = JSON.parse(decodeURIComponent(results[0].seo_info));

                // Render view
                _module.render(req, res, 'post.html', {
                    item: results[0],
                    seo_info: seo_info,
                    categories: results[1].rows
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack)
        });
};

module.exports = _module;