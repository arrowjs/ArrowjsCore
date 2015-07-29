'use strict';

let redis = require('redis').createClient();
let promise = require('bluebird');
//let getRedis = promise.promisify(redis.get);

//function() {
//        let w;
//        return redis.get('arrWidgets', function (err, result) {
//            if (err || result == null || result == undefined) {
//                let widgets = __.getOverrideCorePath(__base + "core/widgets/*/*.js", __base + "app/widgets/*/*.js", 2);
//                w = [];
//                for (let index in widgets) {
//                    if (widgets.hasOwnProperty(index)) {
//                        let Widget = require(widgets[index]);
//                        w.push(new Widget());
//                    }
//                }
//                //console.log(JSON.stringify(w));
//                redis.set('arrWidgets', JSON.stringify(w), redis.print);
//                return w
//            } else {
//                return (JSON.parse(result));
//            }
//        });
//}

module.exports = function getData() {
    let w;
    //redis.get('arrWidgets', function (err, result) {
    //    if (err || result == null || result == undefined) {
            let widgets = __.getOverrideCorePath(__base + "core/widgets/*/*.js", __base + "app/widgets/*/*.js", 2);
            w = [];
            for (let index in widgets) {
                if (widgets.hasOwnProperty(index)) {
                    let Widget = require(widgets[index]);
                    w.push(new Widget());
                }
            }
            global.__widget = w;
            return w;
            //console.log(JSON.stringify(w));
    //        redis.set('arrWidgets', JSON.stringify(w), redis.print);
    //        cb(w)
    //    } else {
    //        cb(JSON.parse(result));
    //    }
    //})
}