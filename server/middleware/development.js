var expressLogger = require('morgan');
var errorhandler = require('errorhandler');
var compression = require('compression');
var methodOverride = require('method-override');
var cors = require('cors');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var config = require('../config');
var proxy = require('./proxy');
var logger = require('../logger');
var negotiate = require('./negotiation');
var routes = require('../routes');

module.exports = function production() {

  config.app.use(expressLogger('dev'));
  config.app.use(errorhandler());
  config.app.use(compression());
  config.app.use(methodOverride('X-HTTP-Method-Override'));
  config.app.use(cors());
  config.app.use(negotiate());

  // Proxies must be configured before the mock routes so they can be intercepted
  // and forwarded to appropriate server
  if(config.isProxyEnabled()) {
    logger.success('proxy configurations detected');
    config.app.use(proxy());
  }else {
    logger.warn('no proxy configurations detected');
  }

  config.app.use(bodyParser.json()); // parse application/json
  config.app.use(bodyParser.urlencoded({
    extended: true,
    limit: '20mb'
  })); // // parse application/x-www-form-urlencoded
  config.app.use(busboy({ immediate: true }));

  config.app.use('/', config.router);
  routes.init();

};