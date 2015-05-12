//=========================================================
// Launch Browsers from Node for DOM testing
// NOTE: browser-launcher makes it east to lauch locally
//       instaled browsers. BUT we can extend that with
//       the ability to start virtualbox and launch IEs
// NOTE: If you want to launch IE vBoxes, you need to install
//       them with the following curl command documented here:
//       https://github.com/xdissent/ievms
//=========================================================


var argv       = require('minimist')(process.argv.slice(2));
var request    = require('request');
var launcher   = require( 'browser-launcher2' );
var os         = require('os');
var child_proc = require('child_process').execFile; //newer node has better stuff

//console.log(argv); //See how to use minimist args

if(argv.help){ //node dom_test_runer --help
 console.log("Available arguments:");
 console.log("    --showAvailable      Lists every browser detected on this host");
 console.log("    --runAllLocal        Runs every browser detected on this host");
 console.log("    --specificBrowser    Runs ONLY the specified browser (--specificBrowser=chrome)");
 console.log("    --showDerivedIP      Show the IP used for communication with virtualBox");
 console.log("    --vboxIE             Starts vBox and runs IE; Shuts down on complete; (requires xdissent/ievms)");
 console.log("    --headless           Runs all browsers in headless mode");
 console.log("    --targetURL          What URL invokes the testing");
}


//=========================================================
// Set your target: i.e. some route that would include your
// test bridge...  (conditionally include your tests.js)
// NOTE: if you want to comunicate with a browser on vBox,
//       you cannot simply use 'localhost'
//       For that we should use the wlan0 IP so that
//       the vBox browser can asscess and post back.
//=========================================================
var address = '';
var interfaces = os.networkInterfaces();

if(interfaces['wlan0']){ 
   address=interfaces['wlan0'][0]['address']; 
}else if(interfaces['lo']){
   address=interfaces['lo'][0]['address'];
}else{
   address='localhost';
}


var targetURL = argv.targetURL || 'DOMTest';
var server_url = 'http://'+address+':8080';
var target_url = server_url + '/' + targetURL;

if(argv.showDerivedIP){
   console.log(server_url);
   //process.exit(0);
   end_testHarness();
}

if(argv.runAllLocal || argv.vboxIE){
   request.post(server_url+'/register_browser', {form:{"testsStarted":true}}, function(){
     //console.log("Launching all specified browsers:");
   });
}


//=========================================================
// Pick your Browser:
//   By default, we scan for all local browsers, and run
//   all of those that are found. However, to invoke just 
//   a single browser, use:
//   --specificBrowser=chrome
//
//   That will override @available_browsers with ['chrome']; 
//   Other local options are ['firefox', 'safari']
//=========================================================
var available_browsers = [];
launcher.detect( function( available ) {
    
    for(var index in available) { 
       available_browsers.push( available[index]["name"] ); 
    }
    if(argv.showAvailable){
       console.log( 'Available browsers:' );
       console.log(available_browsers);
       //process.exit(0);
       end_testHarness();
    }
    if(argv.specificBrowser){
      available_browsers = [argv.specificBrowser];
       run_them_all();
    }
    if(argv.runAllLocal){
       run_them_all();
    }

});



//=========================================================
// Prepare for Launch
//=========================================================
function run_them_all(){

 launcher( function( err, launch ) {

    if ( err ) { return console.error( err ); }

    //=========================================================
    // Open each Browser and let it Rip
    // TODO: figure out the avaliavle options: 
    //  like "--window-size=800,600"
    //=========================================================

    for (var i=0; i<available_browsers.length; i++) {
    //for (var i in available_browsers){
    
        var browser = available_browsers[i];
    
        launch( target_url, {"browser":browser, "headless":argv.headless, "options":[]}, function( err, instance ) {
            if ( err ) {
                return console.error( err );
            }
            //console.log(instance);
            var thisBrowser = instance.command;
            thisBrowser = thisBrowser.replace(/google-/,"");

            request.post(server_url+'/register_browser', {form:{"browser":thisBrowser, "PID":instance.pid}})

            console.log( thisBrowser + ' Instance started with PID:', instance.pid );
            instance.on( 'stop', function( code ) {

                var thisBrowser = this.command;
                console.log( thisBrowser + ' Instance stopped with exit code:', code );

                
                //Plug for hanging headless browsers after stop
                var index = -1;
                for (var j=0; j<available_browsers.length; j++) {
                    if(thisBrowser.match(available_browsers[j])){
                       index = j;
                    }
                }                 
                if (index > -1) { available_browsers.splice(index, 1); } 
                if(available_browsers.length == 0 && (!argv.vboxIE)){ 
                     end_testHarness();
                }
            } );
    
    
            check_browser(browser);
            
    
            //======================================================
            // Close the browser when tests are complete.
            // NOTE: you could also leave tests open where they fail
            //======================================================
            function check_browser(browser){
                request(server_url+'/check_browser?browser='+browser, function (error, response, body) {
                    if (!error) {
                        var json = JSON.parse(body);
                        var browser_status = json.status;
                        //console.log(browser +" status is " + browser_status);
                        if (browser_status==='finished'){
                           instance.stop();
                        }else{
                           setTimeout(function(){ check_browser(browser); }, 3000);
                        }
                    }
                });
            }
    
        });//End Browser Specific launch()
    
    }//End foreach available browser on this system

 });//end launch control

}//end run_them_all



//==========================================================
// Launch any Vbox Browsers (Prototype/Experimental)
//==========================================================
var vbox_path  = '';
if     (os.platform()==='darwin'){     vbox_path  = '/usr/bin'; }
else if(os.platform()==='linux' ){ vbox_path  = '/usr/lib/virtualbox'; }


var versions = [];

if(argv.vboxIE){
  versions = argv.vboxIE.toString().split(',');
  
  //Some Validation: Only Run VBox versions loaded locally
  //  "IE9 - Win7" {0c8a9e92-7650-406d-9c8c-7566c83e11f2}
  //  "IE10 - Win7" {3224f86f-af91-4761-a2d4-4c4cbbd2be49}
  //  "IE11 - Win7" {7e9ba84a-483e-416a-b34c-a48645cb4c53}
  var loaded_versions = [];
  child_proc(vbox_path+'/VBoxManage', ['list', 'vms'], function(error,stdout,stderr){

      for (var j=0; j<versions.length; j++) {
          var desired_name = "IE" + versions[j] + " - Win7";
          if(stdout.match(desired_name)){
             loaded_versions.push( versions[j] );
          }
      }                 
      
      versions = loaded_versions;

      run_next_vm();  //this shifts off versions, if any

  }); 

}

function run_next_vm(){
 if(versions.length === 0){ 
     //process.exit(0); 
     end_testHarness();
 }
 var version = versions.shift();
 var ie_flavor  = 'IE' + version + ' - Win7';
 var browser = 'ie' + version;
 if(version && version.match(/\d/)){
   start_vm(ie_flavor, browser); 
 }
}



//=========================================
// Start a VM
//=========================================
function start_vm(ie_flavor, browser){
  var vboxHeadless = ''; //default is NOT headless
  
  console.log("Starting VM "+ie_flavor);
  request.post(server_url+'/register_browser', {form:{"browser":browser, "PID":"vBox"}})
  if(argv.headless){
    child_proc(vbox_path+'/VBoxManage', ['startvm', ie_flavor, '--type', 'headless'], wait_for_vm_to_boot(ie_flavor, browser));
  }else{
    child_proc(vbox_path+'/VBoxManage', ['startvm', ie_flavor], wait_for_vm_to_boot(ie_flavor, browser));
  }
}

//=========================================
// Wait for vm to boot
//=========================================
function wait_for_vm_to_boot(ie_flavor, browser){

   setTimeout(function(){
      child_proc(vbox_path+'/VBoxManage', ['showvminfo', ie_flavor], function(error,stdout,stderr){
           if(stdout.match(/Additions run level:\s+3/)){
              console.log("VM has fully booted.")

              //Set a standard window size
              //VBoxManage controlvm "IE9 - Win7" setvideomodehint 1280 680 32
              child_proc(vbox_path+'/VBoxManage', ['controlvm', 
                                                   ie_flavor, 
                                                   'setvideomodehint',
                                                   '1280', '680', '32'], function(error,stdout,stderr){
                  //Then crack open IE
                  open_ie_on_vm(ie_flavor, browser);
              });
           }else{
              console.log("Waiting for VM to boot.");
              setTimeout(wait_for_vm_to_boot(ie_flavor, browser), 3000);
           }
      });
   },3000);
}

//=========================================
// Load an IE link on that vm
//=========================================
function open_ie_on_vm(ie_flavor, browser){
       console.log("Opening IE on VM.")
       child_proc(vbox_path+'/VBoxManage',
                   ['guestcontrol',
                    ie_flavor,
                    'exec',
                    'C:\\Progra~1\\Intern~1\\iexplore.exe',
                    '--username',
                    'IEUser',
                    '--password',
                    'Passw0rd!',
                    target_url
                   ], wait_for_post_to_complete(ie_flavor, browser));
}

//=========================================
// Wait for webpage POST to complete
//=========================================
function wait_for_post_to_complete(ie_flavor, browser){
    request(server_url+'/check_browser?browser='+browser, function (error, response, body) {
        if (!error) {
            var json = JSON.parse(body);
            var browser_status = json.status;
            //console.log(browser +" status is " + browser_status);
            if (browser_status==='finished'){
                console.log('POST is complete.');
                //setTimeout(take_a_screenshot(ie_flavor, browser), 5000);
                shutdown_vm(ie_flavor, browser);
 
            }else{
               setTimeout(function(){ wait_for_post_to_complete(ie_flavor, browser); }, 3000);
            }
        }
    });
}


//=========================================
// Take a screenshot and then shutdown
//=========================================
function take_a_screenshot(ie_flavor, browser){
  console.log("Taking a Screenshot");
  child_proc(vbox_path+'/VBoxManage', ['controlvm', ie_flavor, 'screenshotpng', './DOMTest/'+ie_flavor+'_screenshot.png'], shutdown_vm(ie_flavor, browser));
};


//=========================================
// Shutdown WIN7 or XP
//=========================================
function shutdown_vm(ie_flavor, browser){
       console.log("Shutting Down VM.")
       child_proc(vbox_path+'/VBoxManage',
                   ['guestcontrol',
                    ie_flavor,
                    'exec',
                    '--image',
                    'shutdown.exe',
                    '--username',
                    'IEUser',
                    '--password',
                    'Passw0rd!',
                    '/s', '/f', '/t', '0'
                   ], wait_for_shutdown_to_complete(ie_flavor, browser));

}

//=========================================
// Wait for shutdown to complete
//=========================================
function wait_for_shutdown_to_complete(ie_flavor, browser){

   setTimeout(function(){
      child_proc(vbox_path+'/VBoxManage', ['showvminfo', ie_flavor], function(error,stdout,stderr){
           if(stdout.match(/powered off/)){
              console.log("VM has powered off.")
              //process.exit(0);
              run_next_vm()
           }else{
              console.log("Waiting for VM to shut down.");
              setTimeout(wait_for_shutdown_to_complete(ie_flavor, browser), 3000);
           }
      });
   },3000);
}




function end_testHarness(){
   request.post(server_url+'/register_browser', {form:{"testsEnded":true}}, function(){  
     console.log("All Browser Runs Complete.");
     process.exit(0);  
   });
   //process.exit(0);
}


