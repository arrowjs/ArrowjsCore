module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            dist : {
                options: {
                    destination: 'apidocs',
                    configure: './conf.json',
                    template: 'node_modules/ink-docstrap/template'
                }
            }
        }
    });
    grunt.registerTask('default', ['grunt-jsdoc']);
    grunt.loadNpmTasks('grunt-jsdoc');
};