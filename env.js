// # Env.js

// ## Global variables

colors        = require('colors');
fs            = require("fs");
util          = require('util');
url           = require('url');
mongoose      = require('mongoose');
crypto        = require('crypto');
_             = require("underscore")._;
API           = require('./lib/api');

// Variable to hold the current environment
ENV           = process.env.NODE_ENV || "development";

// Environment-specific configuration
API.config = JSON.parse(fs.readFileSync('config.json'))[ENV];

// Port to listen to
listening_to  = API.config['listen'] || (process.env.PORT || 3001);

// Set configuration variables to connect to [MongoDB](http://www.mongodb.org/)
mongo_url     =  API.config["mongo_url"];
mongo_set     =  API.config["mongo_set"];

// Helpers
Helpers = require('./helpers.js');

// Used to connect to remote services like push notifications or email services
ServiceConnection = require('./lib/service_connection.js');

// Initialize mySQL client
var MySqlClient = this.MySqlClient = require('mysql').Client
mysql           = this.mysql = new MySqlClient(API.config["mysql"]);

// Load Mongoose models
require('./models/api_table.js');
ApiTable = mongoose.model('api_table');

require('./models/request_analytic.js');
RequestAnalytic = mongoose.model('request_analytic');

// Require controllers
AppController       = require('./controllers/app_controller.js').build.call(this);
EndPointController  = require('./controllers/end_point_controller.js').build.call(this);
ServiceController   = require('./controllers/services_controller.js').build.call(this);
ApiTablesController = require('./controllers/api_tables_controller.js').build.call(this);
