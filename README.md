search-crawler
==============

A simple and easy to use search server written in node.js and MongoDb.

### Architecture

![Architecture](https://raw.githubusercontent.com/davideicardi/search-crawler/master/docs/architecture.png)

Search-Crawler is composed by a Node.Js web application to manage one or more websites and a set of json based REST API that can be used to query crawled pages and integrate the result inside any existing website.

Website crawling is implemented using [Christopher Giffard's SimpleCrawler](https://github.com/cgiffard/node-simplecrawler). Pages are stored in a MongoDb and search is powered by a full text mongodb query, see [full text index](http://docs.mongodb.org/manual/core/index-text/).

### Screenshots

![site detail](https://raw.githubusercontent.com/davideicardi/search-crawler/master/docs/site-detail.png)

![site list](https://raw.githubusercontent.com/davideicardi/search-crawler/master/docs/site-list.png)

### Installation

To install search-crawler you need the following components:

- Node.Js (>= 0.10.28)
- MongoDb (>= 2.6)

You can install it in any operating system that support the above components, Windows, Linux or Mac.

You can get the latest version of search-crawler at github. 
To install a node.js application you can run the following command inside the folder 
where you have downloaded the package:

    npm install
    
These will install in the current folder all the required libraries.

After installation you can execute the node.js application by executing:

    npm run server

By default the web server is created at port 8181, so you can browse it at [http://localhost:8181](http://localhost:8181).

By default Search-Crawler try to connect to a mongo database using the following url: 

	mongodb://localhost:27017/search-crawler


### Configuration

See ./src/config.js

### REST API

Other then the user interface the following REST API are available:

- GET `/api/sites` : get the list of registered sites
- GET `/api/sites/:siteName` : get a specific site by its name
- GET `/api/sites/:siteName/pages` : get the list of pages of a specific site
- POST `/api/sites` : create a new site
- POST `/api/sites/:siteName/update-config` : update a site configuration
- DELETE `/api/sites/:siteName` : delete a specific site
- POST `/api/sites/:siteName/crawl` : start crawling process of a specific site
- POST `/api/sites/:siteName/register-page` : add a specific page to a site
- DELETE `/api/sites/:siteName/remove-pages` : remove all the pages from a site
- GET `/api/sites/:siteName/page-count` : get the registered page count of a site
- GET `/api/sites/:siteName/search?query=:query&limit=:limit` : search for a given expression inside a site

### Debugging

You can debug Search-Crawler using [node inspector](https://github.com/node-inspector/node-inspector) with the following command:

	npm run server-debug


### Unit tests

Run karma unit tests with the following command:

    npm run test-unit


### End to ent tests

Run mocha end to end tests with the following command:

    npm run test-e2e


### Server software stack

- [Node.js](http://nodejs.org/) + [express](http://expressjs.com/) + [mongodb](http://www.mongodb.org/)
- [simplecrawler](https://github.com/cgiffard/node-simplecrawler), [mongoose](http://mongoosejs.com/), [cheerio](https://github.com/cheeriojs/cheerio)

### Client software stack

- [AngularJS](https://angularjs.org/) + [Foundation](http://foundation.zurb.com/)

### References

- Node.js tests: http://www.clock.co.uk/join-us#op-42180-placement-software-engineer
- mongoose-q: https://github.com/iolo/mongoose-q/blob/master/index.js

### TODO

- Add authentication (for administration and API)
- Better text() on parser (add space between tags)
- Crawling job
- Better crawling experience inside administration web site (start/stop, percentage, pages crawled, ...)
- Support for robots.txt
- Support for sitemaps

### License

*MIT License* 

Copyright (c) 2014 Davide Icardi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 

