//=======================================================================================
// This is an example of how we  can run DOM manipulating tests and report the results
// back to the server.  The only magic here is the use of a jQuery.queue()
// to serialize our tests like selenium.
//
//   NOTE there are only a few core DUnit functions: 
//
//      DUnit.waitFor(jquerySelector, matchPattern, timeout, callback)
//
//      DUnit.task(function, postTaskDelay)
//
//      DUnit.test(testFunction, testName)
//
//      DUnit.waitForAjax(endpointName, timeout, callback)
//
//      DUnit.pause(delay);
//
//      DUnit.takeScreenshot(filename);
//
//      DUnit.done();
//
//=======================================================================================


    // Wait for page to be fully "ready"
    DUnit.waitFor(jQuery("#status"), /Go/, 5000, function(selector){
        selector.flash( 'yellow', 250 );
    });


    // Enter some data
    DUnit.task(function(){
        var data = jQuery("#data");
        data.val('71010');
        data.flash( 'yellow', 250 );
        DUnit.test(data.val()==='71010', "Input Code");
    }, 500);

    
    // Click the button
    DUnit.task(function(){
        var button = jQuery("#button");
        button.flash( 'yellow', 250 );
        button.trigger("click");
    }, 500);


     // Check the copy
    DUnit.task(function(){
        jQuery("#code_name").flash( 'yellow', 250 )
        DUnit.test(jQuery("#code_name").html()==='71010', "The copy Worked!");
    }, 500);


    // Run some Ajax
    DUnit.task(function(){
        var button = jQuery("#ajaxButton");
        button.flash( 'yellow', 250 );
        button.trigger("click");
    }, 500);


    // Example of waiting for a SPECIFIC Ajax to complete.
    // In this case we know we are hitting the "/ajax_test" endpoint
    // So we wait for that one to complete (for a max of 10 seconds)
    // Also we check that the postBody contained expected data
    DUnit.waitForAjax("/ajax_test", 10000, function(data){
        console.log("Ajax is complete");
        jQuery("#ajaxResults").flash( 'yellow', 250 );

        DUnit.test(jQuery("#ajaxResults").html().match(/success/), "The Ajax Worked!");

        DUnit.test(data.match(/something/), "The postBody contained something!");
    });




    // Not a wait, but a pause example
    // DUnit.pause(2000);

     

    // Call it when you need it, and generate pngs
    DUnit.screenshot('testApp');



    // Wrap up your testing
    DUnit.done();














