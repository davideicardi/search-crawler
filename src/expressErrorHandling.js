"use strict";

var logErrors = function (err, req, res, next) {
    console.error(err.stack);
    next(err);
  };

var clientErrorHandler = function (err, req, res, next) {
    if (req.xhr) {
      renderError(res, err);
    } else {
      next(err);
    }
  };

var errorHandler = function (err, req, res, next) {
    renderError(res, err);
  };

var renderError = function(res, err){
    console.error(err);

    res.statusCode = 500;

    var msg = 'unhandled server error';
    if (typeof err.data == 'string'){ // schema error?
        msg = err.data;
    }
    else if (typeof err.message == 'string'){ // mongo error + custom error (Error object)
        msg = err.message;
    }
    else if (typeof err == 'string'){ // custom error
        msg = err;
    }
    
    res.json({message: msg});
};

exports.renderError = renderError;

exports.init = function(app){
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
};
