//Object.keys(struc.path).map(function (id) {
//    if (_.isNaN(parseInt(id))) {
//        struc.path[id].path.map(function (globMaker) {
//            let componentGlobLink = path.normalize(_base + globMaker(self._config));
//            let listComponents = __.getGlobbedFiles(componentGlobLink);
//            let componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
//            listComponents.forEach(function (link) {
//                let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
//                    return (node !== "..")
//                });
//                let componentConfigFunction = require(link);
//                if (typeof componentConfigFunction === "function") {
//                    let componentConfig = componentConfigFunction();
//                    let componentName = componentConfig.name || nodeList[0];
//                    paths[id] = paths[id] || {};
//                    paths[id][componentName] = {};
//                    paths[id][componentName].configFile = link;
//                    paths[id][componentName].path = componentFolder + nodeList[0];
//                    paths[id][componentName].strucID = id;
//                }
//            });
//        });
//    } else {
//        struc.path[id].path.map(function (globMaker) {
//            let componentGlobLink = path.normalize(_base + globMaker(self._config));
//            let listComponents = __.getGlobbedFiles(componentGlobLink);
//            let componentFolder = componentGlobLink.slice(0, componentGlobLink.indexOf('*'));
//            listComponents.forEach(function (link) {
//                let nodeList = path.relative(componentGlobLink, link).split(path.sep).filter(function (node) {
//                    return (node !== "..")
//                });
//                let componentConfigFunction = require(link);
//                if (typeof componentConfigFunction === "function") {
//                    let componentConfig = componentConfigFunction();
//                    let componentName = componentConfig.name || nodeList[0];
//                    paths[componentName] = {};
//                    paths[componentName].configFile = link;
//                    paths[componentName].path = componentFolder + nodeList[0];
//                    paths[componentName].strucID = id;
//                }
//            });
//        });
//    }
//})