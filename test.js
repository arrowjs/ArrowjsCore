"use strict";
//let buildStructure = require("./ff");
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

let object2 = {
    modules: [{
        "path": {
            "folder": "/core",
            "file": "module.js",
            "name" : "frontend"
        },
        "controller": {
            "path": {
                "folder": "controller",
                "file": "*.js"
            }
        },
        "route": {
            "path": {
                "file": "route.js"
            }
        }
    },{
        "path": {
            "folder": "/app",
            "file": "module.js",
            "name" : "backend"
        }
    }
    ]
}

let a = buildStructure(object2);
//console.log(a);