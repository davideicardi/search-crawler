search-crawler
==============

A simple search server written in node.js and MongoDb.

### Architecture

![Architecture](https://raw.githubusercontent.com/davideicardi/search-crawler/master/public/architecture.png)

Search-Crawler is composed by a Node.Js application that can crawl one or more web sites and store found pages in a MongoDb.
It also expose a set of json based REST API that can be used to query crawled pages and integrate the result inside another application, typically the original website.

Search is powered by a full text mongodb query, see [full text index](http://docs.mongodb.org/manual/core/index-text/).

### Screenshots

### Installation

To install search-crawler you need the following components:

- Node.Js (>= 0.10.28)
- MongoDb (>= 2.6)

You can install it in any operating system that support the above components, Windows or Linux.

You can get the latest version of search-crawler at github. 
To install a node.js application you can run the following command inside the folder 
where you have downloaded the package:

    npm install
    
These will install in the current folder all the required libraries.

After installation you can execute the node.js application by executing:

    node server.js

server.js is the main node js application file. 
This command execute a node.js web server that you can use to manage sites and crawling process.
By default the web server is created at port 8181, so you can open it by running http://localhost:8181.

### Configuration

### REST API

### TODO

- Add authentication (for administration and API)
- Better text() on parser (add space between tags)
- Crawling job
- Better crawling experience inside administration web site (start/stop, percentage, pages crawled, ...)
- Remove pages when removing site
- Support for robots.txt
- Support for sitemaps?


### License

*[MIT License]* 

Copyright (c) 2014 Davide Icardi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 

