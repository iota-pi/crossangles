/* jshint node:true */

module.exports = function (grunt) {
    grunt.initConfig({
        critical: {
            dist: {
                options: {
                    base: './'
                },
                src: 'index.html',
                dest: 'dist/index.html'
            }
        }
    });

    grunt.loadNpmTasks('grunt-critical');

    grunt.registerTask('default', ['critical']);
};
