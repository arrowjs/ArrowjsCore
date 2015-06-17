'use strict'
var socket = require('socket.io'),
    config = require(__base + 'config/config');

function SocketManager(server) {
    let self = this;
    self.sockets = [];
    self.io = socket.listen(server);
    self.io.on('connection', function (socket) {
        socket.on('disconnect', function () {
            socket.disconnect();
        });
        /*config.getGlobbedFiles(__base + 'app/socket_io/!*.js').forEach(function (path) {
            require(path)(self, socket);
        });*/

    });
    self.publish = function (key, data, options) {
        self.io.emit(key, data);
    };
}

module.exports = function (server) {
    return new SocketManager(server);
};



