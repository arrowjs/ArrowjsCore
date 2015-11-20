"use strict";

module.exports = {
    services : {
        user : {
            protocol : "tcp",
            host : "127.0.0.1",
            port : "3333",
            type : "req",
            connect_type : "connect" // "bindSync" , "bind"
        }
    }
};