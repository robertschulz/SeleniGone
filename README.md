# SeleniGone - DOM tests in pure jQuery

+ Selenium and Grid complexity got you down?
+ Want to write your DOM tests in jQuery?
+ Want to use the same selectors you use in your app?
+ Want to work locally? 

Then SeleniGone may be right for you. 

Lets face it. Maintaining a selenium grid stinks. So does shipping your code off to Sauce. Also, Karma is great, but I still don't want multiple machines so I can test flavors of IE.

I want to be on a remote island and still be able to check my code on all supported browsers and devices.

VirtualBox is your friend.

NPM is your friend.

Use this pattern to ease your UI testing pain.

*NOTE: SeleniGone will soon be packaged as an npm plugin.*   
  
<br>  

### Basic Usage

**There are only a few core DUnit functions:**
 
```javascript
DUnit.waitFor(jquerySelector, matchPattern, timeout, callback);

DUnit.task(function, postTaskDelay);

DUnit.test(testFunction, testName);

DUnit.waitForAjax(endpointName, timeout, callbackOn(postData));

DUnit.pause(delay);

DUnit.takeScreenshot(domElement);

DUnit.done();

```

**NOTE:**

DUnit.test() is usually used within a task.

Tasks should have no internal delays. They should be immediate

If you need to delay two events, use two separate tasks and a pause between.

In many cases, waitForAjax is vastly superior to a dumb pause

**An Example Failing Test, wrapped in a task:**

```javascript
DUnit.task(function(){
  DUnit.test(true===false, "Truth Test");
  }, 200);
```

### PreRequisites :: Install VirtualBox

sudo apt-get install unar

sudo apt-get install virtualbox-guest-additions-iso

`curl -s https://raw.githubusercontent.com/xdissent/ievms/master/ievms.sh | env IEVMS_VERSIONS="9 10 11" bash`



### Running the example framework

`npm install`

`node server`

Point a browser at localhost:8080 and you can see a tutorial.

Note, if you use chrome, you may need to use incognito.

With the demo app, you can see examples of how to write DOM tests, and how to easily run them with the click of a button.

These tests can be run headlessly or in full view.

When the tests are complete, follow the link to the resulting snapshots of your application in the various browsers.

While you can easily invoke the DOM testing with the click of a button, you can also run these tests manually (with more options). 

With the node server running, issue these commands in a separate terminal:
 
### Invoke the Tests (i.e. a grunt watch task)
`node DOMTest/runner --help`

`node DOMTest/runner --specificBrowser chrome`

`node DOMTest/runner --runAllLocal --vboxIE=9,10,11`

Or, more simply:

`grunt dom_runner`

### Develop Tests

Whats handy is that you can run these tests directly on the devtools console.

Simply define as many tasks and tests as you like and invoke:

`DUnit.runTasks();`
