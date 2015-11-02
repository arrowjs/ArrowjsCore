module.exports = {
    services: {
        "path": {
            "folder": "/service",
            "file": "service.js"
        },
        "extends": {},
        "model": {
            "path": {
                "folder": "app",
                "file": "model.js"
            }
        },
        "view": {
            "path": {
                "folder": "/view",
                "file": "view.js"
            }
        },
        "controller": {

        }
    },
    modules: [{
        "path": {
            "folder": "/app/modules",
            "file": "module.js"
        },
        "extends": {
            system : false,
            active : false
        },
        "model": {
            "path": {
                "folder": "/app",
                "file": "model.js"
            }
        },
        "view": {
            "path": {
                "folder": "/app",
                "file": "module.js"
            }
        },
        "controller": {
            "path": {
                "folder": "/app",
                "file": "*.js"
            }
        },
        "helper": {
            "path": {
                "folder": "/app",
                "file": "*.js"
            }
        },
        "route": {
            "path": {
                "folder": "/app",
                "file": "*.js"
            }
        }
    }, {
        "path": {
            "folder": "/core/modules",
            "file": "module.js"
        },
        "extends": {
            system : true,
            active : true
        },
        "model": {
            "path": {
                "folder": "models",
                "file": "*.js"
            }
        },
        "view": {
            "path": {
                "folder": "views"
            }
        },
        "controller": {
            "path": {
                "folder": "controller",
                "file": "de*.js"
            }
        }
    }]
}