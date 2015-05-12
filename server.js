//=================================================
// General Setup
//=================================================
var express   = require("express");
var app       = express();
var DOMTester = require('./DOMTest/DOMRoutes'); 
var PORT      = 8080;



//======================================================
// Routes for serving your app (and/or, an index page)
//======================================================
app.get('/',function(req, res){
      res.sendFile(__dirname + '/index.html');
});
app.get('/app',function(req, res){
      res.sendFile(__dirname + '/app.html');
});


//======================================================
// For serving the dom test js, have a special route
// that points back to the same app. The route can
// trigger inclusion of the test scripting. OR,
// You could also invoke this js inclusion by parameter.
//======================================================
app.get('/DOMTest',function(req, res){
      res.sendFile(__dirname + '/app.html');
});



//=================================================
// Include the DOMTester Routes
//=================================================
DOMTester.addRoutes(app);


//=================================================
// Start the server
//=================================================
app.listen(PORT,function(){
  console.log("Started on PORT "+PORT.toString());
  console.log("");
  console.log("Open a browser to http://localhost:"+PORT.toString());
})

