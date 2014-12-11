module.exports = function (grunt) {
    'use strict';

    var pkg = grunt.file.readJSON('package.json'),
        banner = [
            '/**',
            '* <%= pkg.name %> - <%= pkg.version %>',
            '*/',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg: pkg,

        concat: {
            build: {
                options: {
                    banner: banner
                },
                src: [
                    './src/intro',

                    './src/static.js',
                    './src/methods/**/*.js',
                    './src/View/**/*.js',
                    './src/exports.js',

                    './src/outro'
                ],
                dest: 'wig.js'
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: {
                src: [
                    'Gruntfile.js',
                    'src/**/*.js',
                    'test/**/*.js'
                ]
            }
        },

        uglify: {
            build: {
                files: {
                    'wig.min.js': 'wig.js'
                }
            }
        },

        mocha: {
            test: {
                options: {
                    reporter: 'XUnit'
                },
                src: ['test/spec-runner.html'],
                dest: 'test-results.xml'
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('test', ['jshint', 'mocha:dev']);
    grunt.registerTask('build', ['jshint', 'concat']);
    grunt.registerTask('deploy', ['build', 'uglify', 'mocha:ci']);
};