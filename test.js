"use strict";
let buildStructure = require("./ff");
let object1 = {
    //modules: {
    //    path : {
    //        folder : "/modules/*/*",
    //        file : "module.js",
    //        depend: "themes"
    //    },
    //    controller: {
    //        path: {
    //            folder : "controller",
    //            file : '*.js',
    //        },
    //    }
    //},
    services: [{
        path : {
            folder : ["app/services","asdasd"],
            file : "module.js",
        }
    },{
        path : {
            folder : "core/modules",
            file : "module.js",
            depend: "themes",
        }
    }]
}

let a = buildStructure(object1);
console.log(a);