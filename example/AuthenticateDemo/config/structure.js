module.exports = {
    features: {
        "path": {
            "folder": "/features",
            "file": "feature.js"
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
