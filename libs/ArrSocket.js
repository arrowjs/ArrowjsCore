'use strict'
/**
 * Created by thanhnv on 3/21/15.
 */

var socket = require('socket.io');

function SocketManager(server) {
    let self = this;
    self.sockets = [];
    self.io = socket.listen(server);
    self.io.on('connection', function (socket) {
        require("../socket_io/chat.js")(self,socket);
    });
    self.publish = function (key, data, options) {
        self.io.emit(key, data);
    };
}

module.exports = function (server) {
    return new SocketManager(server);
};


