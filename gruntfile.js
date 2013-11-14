module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> Created at :<%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			compress: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}		    
		},
		autoprefixer: {
			options: {},
			single_file: {
				src: 'src/required.css',
				dest: 'dist/<%= pkg.name %>.css'
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-autoprefixer');

	// Default task(s).
	grunt.registerTask('default', ['uglify','autoprefixer']);

};