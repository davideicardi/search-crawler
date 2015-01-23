"use strict";

// Here I can modify configuration...
var config = require('./src/config.js');
config.web.port = 8282;

config.crawler.customHeaders.Authorization = "secret";


// Or execute other custom code!


// then run real index.js
require('./index.js');
