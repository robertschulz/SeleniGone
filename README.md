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


### PreRequisites :: Install VirtualBox

sudo apt-get install unar

sudo apt-get install virtualbox-guest-additions-iso

`curl -s https://raw.githubusercontent.com/xdissent/ievms/master/ievms.sh | env IEVMS_VERSIONS="9 10 11" bash`



### Running the example framework

`npm install`

`node server`

With the demo app, you can see examples of how to write DOM tests, and how to easily run them with the click of a button.

These tests can be run headlessly or in full view.

When the tests are complete, follow the link to the resulting snapshots of your application in the various browsers.

While you can easily invoke the DOM testing with the click of a button, you can also run these tests manually (with more options):
 
### Invoke the Tests (i.e. a grunt watch task)
`node DOMTest/runner --help`

`node DOMTest/runner --runAllLocal --vboxIE=9,10,11`

Or, more simply:

`grunt dom_runner`

