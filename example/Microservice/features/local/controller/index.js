'use strict';

const FeedParser = require('feedparser')
    , request = require('request');
const Arrow = require('../../..');
const logger = Arrow.logger;

module.exports = function (controller,component,application) {
    /**
     * Render index view with links to other views
     */
    controller.index = function (req,res) {
        res.render('index');
    };

    controller.localCall = function (req,res) {
        let rssReq = request('http://vnexpress.net/rss/the-gioi.rss');
        let feedparser = new FeedParser({normalize: true, addmeta: false});
        var data = [];
        rssReq.on('error', function (error) {
            logger.error(error);
        });

        rssReq.on('response', function (res) {
            var stream = this;

            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

            stream.pipe(feedparser);
        });


        feedparser.on('error', function(error) {
            logger.error(error);
        });
        feedparser.on('readable', function() {
            // This is where the action is!
            let stream = this
                , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
                , item;

            while (item = stream.read()) {
                data.push(
                    {
                        title: item.title,
                        description: item.description
                    }
                );
            }

        });

        feedparser.on('end', function() {
            res.render('local', {data: data});
        });

    };
};