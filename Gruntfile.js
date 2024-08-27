module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        htmlmin: {
            src: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                },
                files: {
                    'build/tmp/editor.min.html': 'src/modules/editor.html',
                    'build/tmp/form-input.min.html':'src/modules/form-input.html',
                },
            },
        },
        injectHTML: {
            options: {
                editorHtml: 'build/tmp/editor.min.html',
                formInputHtml: 'build/tmp/form-input.min.html',
                src: 'src/modules/ui.js',
                trg: 'build/tmp/ui-with-html.js'
            },
        },
        concat: {
            build: {
                src: [
                    'src/modules/expression-backend.js',
                    'src/modules/cursor.js',
                    'build/tmp/ui-with-html.js',
                ],
                dest: 'build/mjxgui.js',
            },
            buildExample: {
                src: [
                    'src/modules/expression-backend.js',
                    'src/modules/cursor.js',
                    'src/modules/ui.js',
                ],
                dest: 'docs/js/mjxgui.js',
            },
        },
        uglify: {
            options: {
                banner: '/*! mjxgui <%= grunt.template.today("yyyy-mm-dd") %> | (C) Ronak Vakharia (@ronaksv) | MIT License */',
            },
            build: {
                src: 'build/mjxgui.js',
                dest: 'build/mjxgui.min.js',
            },
        },
        cssmin: {
            options: {
                banner: '/*! mjxgui <%= grunt.template.today("yyyy-mm-dd") %> | (C) Ronak Vakharia (@ronaksv) | MIT License */',
            },
            build: {
                src: 'src/mjxgui.css',
                dest: 'build/mjxgui.min.css',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('injectHTML', function () {
        const options = this.options();
        const editorTemplate = grunt.file.read(options.editorHtml);
        const formInputTemplate = grunt.file.read(options.formInputHtml);
        const src = grunt.file.read(options.src);
        
        let content = src.replace(/\{\{\seditor_html\s}}/, editorTemplate);
        content = content.replace(/\{\{\sform_input_html\s}}/,formInputTemplate,);
        // let content = src.replace(/(editorDiv.innerHTML.*)`.*`/,`$1\`${editorTemplate}\``);
        // content = content.replace(/(const formInputHTML.*)`.*`/,`$1\`${formInputTemplate}\``);

        grunt.file.write(options.trg, content);
    });

    grunt.registerTask('default', [
        'htmlmin',
        'injectHTML',
        'concat',
        'uglify',
        'cssmin'
    ]);
    grunt.registerTask('inject-ui', ['htmlmin', 'injectHTML']);
    grunt.registerTask('build', ['inject-ui', 'concat', 'uglify', 'cssmin']);
};
