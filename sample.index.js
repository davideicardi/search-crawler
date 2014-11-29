"use strict";

// Here I can modify configuration...
var config = require('./config.js');
config.web.port = 8282;

// Or execute other custom code!


// then run real index.js
require('./index.js');
