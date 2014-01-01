module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

		min: {
			dist: {
        src: ['src/arctic.js'],
        dest: 'build/arctic.min.js'
			}
		},

    watch : {
      js : {
        files : ['src/*.js'],
        tasks : ['min']
      }
    },

    /*
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src',
          themedir: 'node_modules/yuidocjs/themes/simple',
          outdir: 'doc/api/en'
        }
      }
    },
    */

    jsdoc : {
      dist : {
        src: ['src/arctic.js', 'README.md'], 
        options: {
          destination: 'doc/api/en',
          template: 'submodules/jsdoc3-bootstrap'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-yui-compressor');

  grunt.registerTask('default', ['jsdoc', 'min']);
}
