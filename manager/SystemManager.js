"use strict";
let __ = require('../libs/global_function');
let events = require('events');

class SystemManager extends events.EventEmitter {
    constructor(){
        super();
    }
    getCache(){

    }
    setCache(){

    }
    reload(){

    }
    eventHook(events) {
        this._events =  events._events
    }
}

module.exports =  SystemManager;