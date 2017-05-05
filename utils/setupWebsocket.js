'use strict';
const socketRedisAdapter = require('socket.io-redis');
const socketIO = require('socket.io');
const path = require('path');
const _ = require('lodash');

module.exports = function setupWebsocket(self) {
  if (self.getConfig('websocket_enable') && self.getConfig('websocket_folder')) {
    let io = socketIO(server);
    if (self.getConfig('redis.type') !== 'fakeredis') {
      let redisConf = {host: self.getConfig('redis.host'), port: self.getConfig('redis.port')};
      io.adapter(socketRedisAdapter(redisConf));
    }
    self.io = io;

    __.getGlobbedFiles(path.normalize(self.arrFolder + self.getConfig('websocket_folder'))).map(function (link) {
      let socketFunction = require(link);
      /* istanbul ignore else */
      if (_.isFunction(socketFunction)) {
        socketFunction(io);
      }
    })
  }
}