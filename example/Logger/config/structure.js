module.exports = {
    features: {
        path: {
            folder: "/features",
            file: "feature.js"
        },
        controller: {
            path: {
                folder: "controller",
                file: "*.js"
            }
        },
        view : {
            path :{
                folder : "/public/themes/:theme"
            }
        },
        route: {
            path: {
                file: "route.js"
            }
        }
    }
};