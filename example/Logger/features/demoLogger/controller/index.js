'use strict';

module.exports = function (controller,component,application) {
    /**
     * Render index view with links to other views
     */
    controller.index = function (req,res) {
        res.render('index',
            {
                title: 'Hello World app',
                links: [
                    {title: 'About this app', link: 'about'},
                    {title: 'Repositories', link: 'repos'},
                    {title: 'Get App folder', link: 'raw'}
                ]
            }
        )
    };

};