module.exports = {
    features: {
        "path": {
            "folder": "/features",
            "file": "feature.js"
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