"use strict";
let __ = require('./../libs/global_function');
let events = require('events');

class SystemManager extends events.EventEmitter {
    constructor(){
        super();
    }
}

module.exports =  SystemManager;