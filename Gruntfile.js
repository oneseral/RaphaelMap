module.exports = function(grunt) {
	grunt.initConfig({
		concat : {
			bar : {
				src : ['bower_components/jquery/dist/jquery.js', 'bower_components/raphael/raphael.js', 'bower_components/angular/angular.js'],
				dest : 'lib.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['concat']);
}