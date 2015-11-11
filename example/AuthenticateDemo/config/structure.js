module.exports = {
    modules: {
        "path": {
            "folder": "/modules",
            "file": "module.js"
        },
        extends : {
          system :true
        },
        model : {
            path: {
                folder : "models",
                file: "*.js"
            }
        },
        controller: {
            path: {
                folder : "controller",
                file: "*.js"
            }
        },
        view : {
          path : {
              folder: "view"
          }
        },
        route : {
            path : {
                file :'route.js'
            }
        },
    }
};
