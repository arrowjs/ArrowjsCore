'use strict';

module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
        res.render('index',
            {
                title: 'Hello World app',
                links: [
                    {title: 'About this app', link: 'about'},
                    {title: 'Repositories', link: 'repos'}
                ]
            }
        )
    };
    /**
     * Return view using Nunjuck template
     * @param req
     * @param res
     */
    controller.about = function (req,res) {
        res.render('about',
            {
                title: 'About Arrowjs.io',
                body: 'Arrowjs.io is framework that is fast, theme-able and extensible'
            })
    };
    /**
     * return JSON
     * @param req
     * @param res
     */
    controller.repos = function(req, res) {
        let repos = [
            { name: 'arrowjs core', url: 'https://github.com/arrowjs/ArrowjsCore' }
            , { name: 'arrowjs cms', url: 'https://github.com/arrowjs/ArrowCMS' }
            , { name: 'examples', url: 'https://github.com/arrowjs/examples' }
            , { name: 'documents', url: 'https://github.com/arrowjs/Documents' }
        ];
        res.json(repos);
    }
};