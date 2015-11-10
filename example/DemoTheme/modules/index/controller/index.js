'use strict';

module.exports = function (controller,component,application) {
    controller.index = function (req,res) {
        res.render('index',
            {news:[
                {
                    title: "Man must explore, and this is exploration at its greatest",
                    desc: "Problems look mighty small from 150 miles up",
                    author: "John Caster",
                    date: "September 24, 2015"},

                {
                    title: "I believe every human has a finite number of heartbeats. I don't intend to waste any of mine.",
                    desc: "Life is short",
                    author: "James Baker",
                    date: "August 15, 2015"
                },

                {
                    title: "Science has not yet mastered prophecy",
                    desc: "We predict too much for the next year and yet far too little for the next ten.",
                    author: "Lilian Tales",
                    date: "July 1, 2015"
                },

                {
                    title: "Failure is not an option",
                    desc: "Many say exploration is part of our destiny, but it’s actually our duty to future generations.",
                    author: "Philips Koeman",
                    date: "June 5, 2015"
                }
            ]}


        )
    };

    controller.about = function (req,res) {
        res.render('about')
    };

    controller.post = function (req,res) {
        res.render('post')
    };

    controller.contact = function (req,res) {
        res.render('contact')
    };
};