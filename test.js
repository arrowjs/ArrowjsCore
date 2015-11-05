"use strict";
let buildStructure = require("./ff");
let object1 = {
    modules: {
        path : {
            folder : "/modules/*/*",
            file : "module.js",
            depend: "themes"
        }
    },
    services: [{
        path : {
            folder : ["app/services","asdasd"],
            file : "module.js",
            name : "Cuong"
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
console.log(a.modules.path["0"].path[0]({themes : 1}));