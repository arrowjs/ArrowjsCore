'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

function BlogModule() {
    BaseModuleFrontend.call(this);
    this.path = "/blog";
}
var _module = new BlogModule();

_module.index = function (req, res) {
    promise.all(
        [
            // Find post by id
            __models.posts.find({
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
            __models.categories.findAndCountAll({
                where: "published = 1 AND id <> 1",
                order: "id,parent ASC"
            })
        ]
    ).then(function (results) {
            if (results[0]) {
                // Get SEO info
                let seo_info = null;

                if (results[0].seo_info && results[0].seo_info != '') seo_info = JSON.parse(decodeURIComponent(results[0].seo_info));

                // Render view
                _module.render(req, res, 'post.html', {
                    item: results[0],
                    seo_info: seo_info,
                    categories: results[1].rows,
                    _breadcrumb: [
                        {
                            title: results[0].title,
                            link: '/' + results[0].id + '/' + results[0].alias + '/'
                        }
                    ]
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        });
};

module.exports = _module;