"use strict";

module.exports = {
    resource : {
        path : 'public',
        option : {
            maxAge: 3600
        }
    },
    viewExtension : "twig",
    pagination: {
        number_item: 20
    },
    theme: "default",
    functionFolder : '/extendsView/function',
    filterFolder : '/extendsView/filter',
    variableFile : '/extendsView/variable.js',
    nunjuckSettings : {
        autoescape: true,
        throwOnUndefined: false,
        trimBlocks: false,
        lstripBlocks: false,
        watch: false,
        noCache: true
        //tags: {
        //    blockStart: '<%',
        //    blockEnd: '%>',
        //    variableStart: '<$',
        //    variableEnd: '$>',
        //    commentStart: '<#',
        //    commentEnd: '#>'
        //}
    }

};