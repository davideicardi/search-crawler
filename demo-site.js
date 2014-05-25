
var express    = require('express');

var app = express();

app.use(express.static(__dirname + '/demo-site'));

app.listen(process.env.PORT || 8182);

console.log("demo-site running...");
