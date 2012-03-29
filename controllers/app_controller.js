// # App Controller

var AppController = function() {
    
  return {
    // Connect to mySQL and MongoDB
    connect_dbs: function() {
      mysql.connect(function(err, result) {
        if (err) return console.log("ERROR:".red, err);
        return console.log("Success".green,"connected".grey, "MySql".yellow);
      });
      
      mongoose.connect(mongo_url, function(err) {
        if (err) return console.log("ERROR:".red, err.message, err.stack);
        return console.log("Success".green,"connected".grey, "Mongo".blue);
      });
    },
    
    // Used as a Connect middleware to debug every request
    debugRequest: function (req, res, next) {
      console.log("Cookies".cyan,  req.cookies);
      console.log("Params".yellow, req.params);
      console.log("Body".green,    req.body);

      next();
    },

    // Used as a Connect middleware to do profiling
    startProfiling: function (req, res, next) {
      req._profile_start = new Date();
      req._profile_stops = [];
      console.log("PROFILE".yellow, "STARTED".green, util.inspect(req._profile_start));
      next();
    },
    
    // 
    profile: function (key, req) {
      req._profile_stops.push([key, new Date()]);
    },

    //
    outputProfile: function (req) {
      var start = req._profile_start;
      var _final = new Date();
      var total = _final - start;

      req._profile_stops.push(["closing", _final]);

      console.log("Total", total);
      var last  = start;
      _.each(req._profile_stops, function(arr) {

        var t = arr[1] - last;
        var p = (t/total)*100;

        console.log(">".blue, t+"ms\t".yellow, p+"%\t".red, arr[0]);
        last = arr[1];
      });

    },
    
    // Checks if the \_app\_token cookie value is valid, if so, it authenticates the request
    authenticateApp: function(req, res, next) {
      var app_id = req.params.app_id;

      mysql.query('SELECT * FROM apps WHERE apps.identifier = ? LIMIT 1', [app_id], function(err, result, fields) {

        if (err || !result.length) {
          console.log("App ", app_id, "failed ", err, result);
          return res.send(Helpers.error("Invalid credentials."));
        }

        var app    = result[0];
        var cookie = req.cookies._app_token;

        if (!cookie) return res.send(Helpers.error("Invalid credentials."));

        var secret = Helpers.decrypt(app.encrypted_secret_key, app.salt);

        if (Helpers.isCookieValid(cookie, app_id, secret)) {
          app.secret = secret;
          req.app = app;
          next();
        } else {
          console.log("Auth Failure!!!".red);

          res.send(Helpers.error("Invalid credentials."));
        }
        return true;
      });

    },
    
    //
    logAnalytic: function(req, res, next) {

      var ra = new RequestAnalytic({});

      ra.doc.app_id         = req.app.identifier;
      ra.doc.host           = req.headers.host;
      ra.doc.timezone       = req.headers['timezone'];
      ra.doc.user_agent     = req.headers['user-agent'];
      ra.doc.device_id      = req.headers['device-id'];
      ra.doc.device_name    = req.headers['device-name'];
      ra.doc.device_version = req.headers['device-version'];

      ra.doc.access_type    = "endpoint";

      ra.save();

      next();
    },
    
    // FOR TESTING PURPOSES
    // DummyApp is defined in lib/dummy_app.js
    populate: function(req, res, next) {
      var test_app = new global.DummyApp();
      test_app.setup_dbs();
      
      res.send(Helpers.success());
      next();
    }
    
  };
};


exports.build = function() {
  return AppController.call(this);
};
