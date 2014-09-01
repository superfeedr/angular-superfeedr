
var ngSuperfeedr = angular.module('ngSuperfeedr', []);

// Base64 helper
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

// Helper to build URLs
function buildUrl(query, _url) {
  var url = 'https://push.superfeedr.com/?';
  if(typeof(_url) != 'undefined')
    url = _url;
  for(var k in query) {
    url += encodeURIComponent(k) + "=" + encodeURIComponent(query[k]) + "&"; 
  }
  return url;
};

// The superfeedr client!
function SuperfeedrClient(http, rootScope, config) {
  this.http = http;
  this.rootScope = rootScope;
  this.config = config;
}

SuperfeedrClient.prototype.list = function list(page, pattern, callback) {
  this.http({method: 'GET', url: buildUrl({
    'hub.mode': 'list',
    'hub.callback': pattern,
    'page': page,
    'authorization': Base64.encode([this.config.login, this.config.token].join(':'))
  })}).
  success(function(data, status, headers, config) {
    callback(null, data);
  }).
  error(function(data, status, headers, config) {
    callback({data: data, status: status});
  });
}

SuperfeedrClient.prototype.retrieve = function retrieve(url, options, callback) {
  if(!options) {
    options = {};
  }
  if(!options.format) {
    options.format = "json";
  }
  options['hub.mode'] = 'retrieve';
  options['hub.topic'] = url;
  options['authorization'] = Base64.encode([this.config.login, this.config.token].join(':'));

  this.http({method: 'GET', url: buildUrl(options)}).
  success(function(data, status, headers, config) {
    callback(null, data);
  }).
  error(function(data, status, headers, config) {
    callback({data: data, status: status});
  });
};

SuperfeedrClient.prototype.unsubscribe = function unsubscribe(topic, callbackUrl, options, callback) {
  params = {
    'hub.mode': 'unsubscribe',
    'hub.topic': topic,
    'hub.callback': callbackUrl,
    'authorization': Base64.encode([this.config.login, this.config.token].join(':'))
  }
  this.http({method: 'POST', url: buildUrl(params)}).
  success(function(data, status, headers, config) {
    callback(null, data);
  }).
  error(function(data, status, headers, config) {
    callback({data: data, status: status});
  });
}

SuperfeedrClient.prototype.subscribe = function subscribe(topic, callbackUrl, options, callback) {
  params = {
    'hub.mode': 'subscribe',
    'hub.topic': topic,
    'hub.callback': callbackUrl,
    'authorization': Base64.encode([this.config.login, this.config.token].join(':'))
  }
  if(options.format) {
    params.format = options.format;
  }
  if(options['hub.secret']) {
    params['hub.secret'] = options['hub.secret'];
  }
  if(options['hub.verify']) {
    params['hub.verify'] = options['hub.verify'];
  }
  if(options['retrieve']) {
    params['retrieve'] = options['retrieve'];
  }

  this.http({method: 'POST', url: buildUrl(params)}).
  success(function(data, status, headers, config) {
    callback(null, data);
  }).
  error(function(data, status, headers, config) {
    callback({data: data, status: status});
  });
}

SuperfeedrClient.prototype.stream = function stream(url, options, callback) {
  if(!options) {
    options = {};
  }
  if(!options.format) {
    options.format = "json";
  }
  options['hub.mode'] = 'retrieve';
  options['hub.topic'] = url;
  options['authorization'] = Base64.encode([this.config.login, this.config.token].join(':'));

  // This is where we should use eventsource :)
  var source = new EventSource(buildUrl(options, 'https://stream.superfeedr.com/?'));
  var that = this;

  source.onerror = function (error) {
    that.rootScope.$apply(function() {
      callback(error);
    });    
  };

  source.addEventListener("notification", function(e) {
    that.rootScope.$apply(function() {
      callback(null, JSON.parse(e.data));
    });
  });
};

// Provider!
ngSuperfeedr.provider('Superfeedr', function() {

  var config = {};

  this.configure = function(_config) {
    config = _config;
    return config;
  }

  this.$get = ["$http", "$rootScope", function Superfeedr($http, $rootScope) {
    return new SuperfeedrClient($http, $rootScope, config)
  }];
});


