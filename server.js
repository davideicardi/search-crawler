
// npm install express
// npm install body-parser
// npm install simplecrawler

var express    = require('express')
var bodyParser = require('body-parser')
var crawler = require("simplecrawler");

var app = express()

app.use(bodyParser())

app.get('/', function(req, res){
    res.send('Search engine');
});

app.post('/crawl', function(req, res){
  
    var url = req.body.url;
    
    console.log("Start crawling " + url);

    crawler.crawl(url)
        .on("fetchcomplete",function(queueItem, responseBuffer , response){
            if (response.headers['content-type'] == "text/html"){
                console.log("Completed fetching resource:",queueItem.url);
            }
        });
  
    res.send('OK');
});

app.listen(process.env.PORT);
