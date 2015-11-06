"use strict";
let buildStructure = require("./ff");
let object1 = {
    modules: {
        path : {
            folder : "/modules/*/*",
            file : "module.js",
            depend: "themes"
        },
        controller: {
            path: {
                folder : "controller",
                file : '*.js',
            },
        }
    },
    services: [{
        path : {
            folder : ["app/services","asdasd"],
            file : "module.js",
            name : "backend"
        }
    },{
        path : {
            folder : "core/modules",
            file : "module.js",
            depend: "themes"
        }
    }]
}

let a = buildStructure(object1);
console.log(a.modules.controller.path["0"].path[0]());