"use strict";

let r = require('nunjucks').runtime;

/**
 * useSocket function view for use socket.io;
 * @type {{name: string, handler: Function}}
 */
module.exports = {
    name: 'useSocket',
    handler: function () {
        var app = this;
        if (app.getConfig('websocket_cluster')) {
            return r.markSafe(`
            <script src="/socket.io/socket.io.js"></script>
            <script>var socket = io({transports: ['websocket']});</script>
            `)
        } else {
            return r.markSafe(`
            <script src="/socket.io/socket.io.js"></script>
            <script>var socket = io();</script>
            `)
        }

    }
};