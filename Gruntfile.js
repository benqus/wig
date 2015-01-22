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
                    banner: banner,
                    separator: '\n\n'
                },
                src: [
                    './src/intro',

                    './src/core/vars.js',
                    './src/core/Class.js',

                    './src/modules/**/*.js',

                    './src/methods/**/*.js',

                    './src/View/View.js',
                    './src/View/**/*.js',

                    './src/**/*.js',

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
                    'test/**/*.js',
                    'examples/**/*.js'
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
            dev: {
                src: ['test/spec-runner.html']
            },
            ci: {
                options: {
                    reporter: 'XUnit'
                },
                src: ['test/spec-runner.html'],
                dest: 'test-results.xml'
            }
        },

        watch: {
            dev: {
                files: [
                    'Gruntfile.js',
                    'src/**/*.js',
                    'test/**/*.js',
                    'test/spec-runner.html'
                ],
                tasks: ['jshint', 'test']
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('dev', ['jshint', 'test', 'watch']);
    grunt.registerTask('build', ['jshint', 'concat']);
    grunt.registerTask('test', ['build', 'mocha:dev']);
    grunt.registerTask('deploy', ['build', 'uglify', 'mocha:ci']);
};