module.exports = {
    modules: {
        "path": {
            "folder": "/modules",
            "file": "module.js"
        },
        "extends": {
            system: true,
            active: true
        },
        "model": {
            "path": {
                "folder": "models",
                "file": "*.js"
            }
        },
        "view": {
            "path": {
                "folder": "view"
            }
        },
        "controller": {
            "path": {
                "folder": "controller",
                "file": "*.js",
                "name" : "abc"
            }
        },
        "helper": {
            "path": {
                "folder": "helper",
                "file": "*.js"
            }
        },
        "route": {
            "path": {
                "file": "route.js"
            }
        }
    }
}