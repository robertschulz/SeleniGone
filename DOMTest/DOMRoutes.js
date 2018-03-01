exports.addRoutes = function(app) {

    var express        =         require("express");
    var bodyParser     =         require("body-parser");
    var uaparser       =         require('ua-parser');
    var colors         =         require('colors');
    var sleep          =         require('system-sleep');
    var fs             =         require('fs');
    var glob           =         require("glob");
    var os             =         require('os');
    var child_proc     =         require('child_process').execFile; 
    
    var browsers = {};
    var testHarness = {};
    
    app.use(bodyParser.urlencoded({ extended: false }));

    console.log(__dirname);

    app.get('/DOMTest/images',function(req, res){
          res.sendFile(__dirname + '/images/app_snapshots.html');
    });
    app.use('/DOMTest', express.static(__dirname + ''));
    
    
    app.post('/register_browser',function(req,res){
      var json=req.body;
      if(json && json.testsStarted){
          testHarness["status"] = 'running';
          res.sendStatus(200);
      }else if(json && json.testsEnded){
          testHarness["status"] = 'complete';
          res.sendStatus(200);
      }else if(json && json.browser){
          browsers[json.browser] = {};
          browsers[json.browser]["status"] = 'started';
          res.sendStatus(200);
      }else{
          sleep(1*1000); //Sleep a second to demo slow ajax
          res.end(JSON.stringify({"slowly":"butSurely"}));
      }
    });
    
    app.get('/check_browser',function(req, res){
        // NOTE: this is passed in from the DOM Test Runner (as its spawning the browsers)
        var browser = req.query.browser;
        res.setHeader('Content-Type', 'application/json');

        var browserLC = '';
        if(browser){ browserLC = browser.toLowerCase(); }

        if(browser && browser.match(/\S/) && browsers[browserLC]){
          res.end(JSON.stringify({ "status": browsers[browserLC]["status"],
                                   "tests":  browsers[browserLC]["tests"]
                                 }));
        }
        else if(browser && browser.match(/\S/) && !browsers[browserLC]){
           res.end(JSON.stringify({ "status": "not registered",
                                   "tests": ""
                                 }));
        }else{
          //TODO: only show browsers statuses 
          res.end(JSON.stringify([testHarness, browsers]));
        }
    });
    
    app.post('/test_results',function(req,res){
      var browser_info = uaparser.parse(req.headers['user-agent']);
      var browser = browser_info.family;
      if(browser.match(/ie/i)){ browser = browser + browser_info.major; }
      var json=req.body;
      var browserLC = browser.toLowerCase();

      //NOTE: currently local browsers dont register_browser()
      if(!browsers[browserLC]){ browsers[browserLC]={} }
      browsers[browserLC]["tests"] = json.tests;
      browsers[browserLC]["status"] = 'finished';
    
      json.browser = browserLC;
    
      if(json.status==='success'){
        console.log('{ ' + 
                    colors.blue.bold(json.browser) + ': ' + colors.green.bold("success") +', ' +
                    'passed: ' + json.passed + ', ' +
                    'total: ' + json.total + ' }');
      }else{
        console.log('{ ' + 
                    colors.blue.bold(json.browser) + ': ' + colors.red.bold("failure") +', '+
                    'failed: ' + json.failed + ', '+
                    'total: ' + json.total + ' }');
    
      }
      
      res.sendStatus(200);
    });
    
    
    app.post('/save_clientside_snapshot', function (req, res){
             var browser_info = uaparser.parse(req.headers['user-agent']);
             var browser = browser_info.family;
             if(browser.match(/ie/i)){ browser = browser + browser_info.major; }
    
             var data        = req.body;
             var filename    = data.filename;
             var image       = data.image;
    
    
             var regex = /^data:.+\/(.+);base64,(.*)$/;
             
             var matches = image.match(regex);
             var ext = matches[1];
             var data = matches[2];
             var buffer = new Buffer(data, 'base64');
             fs.writeFileSync('./DOMTest/images/'+browser+'_'+filename+'.'+ext, buffer);
    
             res.end(JSON.stringify({"save_snapshot":"success", "browser":browser}));
    
    });
    
    app.post('/vbox_snapshot',function(req, res){
        var browser_info = uaparser.parse(req.headers['user-agent']);
        var browser = browser_info.family;
    
        var data        = req.body;
        var filename    = data.filename;
    
        //TODO: be more hip to what vboxes are available and running
        if(browser.match(/ie/i)){ 
            browser = browser + browser_info.major; 
    
            var ie_flavor = browser.toUpperCase()+' - Win7'
    
            var vbox_path  = '';
            if     (os.platform()==='darwin'){ vbox_path  = '/usr/local/bin';      }
            else if(os.platform()==='linux' ){ vbox_path  = '/usr/lib/virtualbox'; }
    
            //call the childproc
            child_proc(vbox_path+'/VBoxManage', ['controlvm', ie_flavor, 'screenshotpng', './DOMTest/images/'+ie_flavor+'_'+filename+'.png'], function(error){
                res.end(JSON.stringify({"vbox_snapshot":"success", "browser":browser}));
            });
        }else{
            res.end(JSON.stringify({"vbox_snapshot":"notApplicable", "browser":browser}));
        }
    });
    
    
    app.get('/get_snapshots',function(req, res){
        var browser = req.query.browser;
        res.setHeader('Content-Type', 'application/json');
    
        glob("./DOMTest/images/*.png", function (er, files) {
          //Strip path
          for (var i = 0; i < files.length; ++i) {
              //console.log(a[index]);
              files[i] = files[i].replace("./DOMTest/", "");
          }
          res.end(JSON.stringify({ "snapshots": files }));
        })
    });
    
    
    app.post('/ajax_test',function(req,res){
      var json=req.body;
      sleep(1*1000); //Sleep a second to demo slow ajax
      res.end(JSON.stringify({"slowly":"butSurely"}));
    });
    
    
    app.post('/multi_browser_dom_test',function(req,res){
      
      //Clear all old stuff, if any
      browsers = {}
    
      //Get parameters
      var json=req.body;
    
      if(json.headless === 'true'){
    
          console.log("Received Headless Browser Launch Directive!");
          child_proc('grunt', ['dom_runner_headless'], function(error){
                //console.log(error);
                res.end(JSON.stringify({"multi_browser_run":"success"}));
          });
    
      }else{
    
          console.log("Received Browser Launch Directive!");
          child_proc('grunt', ['dom_runner'], function(error){
                //console.log(error);
                res.end(JSON.stringify({"multi_browser_run":"success"}));
          });
    
      }
    
      res.end(JSON.stringify({"multi_browser_run":"success"}));
    });




};
