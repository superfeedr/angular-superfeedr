angular-superfeedr
==================

An Angular Provider which wraps the Superfeedr HTTP API.
It implements the following features of the [Superfeedr HTTP API](http://documentation.superfeedr.com/subscribers.html#webhooks):

* [Subscribe to a new feed](http://documentation.superfeedr.com/subscribers.html#addingfeedswithpubsubhubbub)
* [Unsubscribes from a feed](http://documentation.superfeedr.com/subscribers.html#removingfeedswithpubsubhubbub)
* [List all existing subscriptions](http://documentation.superfeedr.com/subscribers.html#listingfeedswithpubsubhubbub)
* [Retrieve past items of a feed](http://documentation.superfeedr.com/subscribers.html#retrievingentrieswithpubsubhubbub)
* [RSS Streaming](http://documentation.superfeedr.com/subscribers.html#streamingrss)

# Install

`bower install ngsuperfeedr

# Usage

Require ngSuperfeedr and inject the Superfeedr service.

```javascript
angular.module('app', [
    'ngSuperfeedr'
]).controller('Ctrl', function(
    $scope,
    Superfeedr
){});
```

Feel free to check the example as well.

