"use strict";
let __ = require('./global_function');
let events = require('events');

class SystemManager extends events.EventEmitter {
    constructor(){
        super();
    }
}

module.exports =  SystemManager;