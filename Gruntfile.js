module.exports = function(grunt) {


  grunt.initConfig({

    execute: {
        headless: {
            src: ['DOMTest/runner.js'],
            options: {
                // run vbox and nonVbox browsers
                args: ['--runAllLocal', '--vboxIE=9,10,11', '--headless']

                // Run just vBox Browsers
                //args: ['--vboxIE=9,10,11', '--headless']

                // Run just local Browsers
                //args: ['--runAllLocal', '--headless']

                // Run just local chrome
                //args: ['--specificBrowser=chrome', '--headless']

                // Run just IE9 headlessly
                //args: ['--vboxIE=9', '--headless']
            }
        },
        NONheadless: {
            src: ['DOMTest/runner.js'],
            options: {
                // run vbox and nonVbox browsers
                args: ['--runAllLocal', '--vboxIE=9,10,11']

                // Run just vBox Browsers
                //args: ['--vboxIE=9,10,11']

                // Run just local Browsers
                //args: ['--runAllLocal']

                // Run just local chrome
                //args: ['--specificBrowser=chrome']

                // Run just IE9
                //args: ['--vboxIE=9']
            }
        },

    }


  }); //End Grunt Init


  // Load the Task Drivers
  grunt.loadNpmTasks('grunt-execute');


  // Specify specific named Tasks
  grunt.registerTask('dom_runner' , 'Running DOM Tests' , ['execute:NONheadless']);
  grunt.registerTask('dom_runner_headless' , 'Running Headless DOM Tests' , ['execute:headless']);

  grunt.registerTask('default' , 'Default is Do Nothing' , []);

};
