// # EndPoint Controller

var EndPointController = function(){

    return { 
      
      index: function(req, res, next) {

      ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name }, function(err, api_table) {
        if (err) {
          console.log("ERROR".red, err, { app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name });
          return res.send(Helpers.error("Error connecting to Database. Internal."));
        }
        if (!api_table) {
          console.log("MISSING TABLE".yellow,  { app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name });
          return res.send(Helpers.error("Couldn't find Table"), 404);
        }
    
        var model = api_table.model(req.app);

        var query  = _.extend(req.query, req.body);

      
        model.find(query, function(err, items) {
          if (err) console.log("ERROR!!!: ".red, err, err.message, "\n\n", err.stack, "\n\n");
          err ? res.send(Helpers.error("There was an error with your query"), 500) : res.send({ results: items });
          model.close();
        }); 
    
        return this;
      });

    },

    count: function(req, res, next) {

      ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name }, function(err, api_table) {
      if (!api_table) return res.send(Helpers.error("Couldn't find Table"), 404);

        var model = api_table.model(req.app);

        var query  = _.extend(req.query, req.body);

        model.count(query, function(err, count) {
          if (err) console.log("ERROR!!!: ".red, err.message.red, "\n\n", err.stack.yellow, "\n\n");
          err ? res.send(Helpers.error("There was an error with your count"), 500) : res.send({ count: count });
          model.close();
        });

        return this;
      });

    },

    create: function(req, res) {

       ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name }, function(err, api_table) {
         if (!api_table) return res.send(Helpers.error("Couldn't find Table"), 404);

         var model = api_table.model(req.app);

         var name  = req.params.name;

         console.log("CREATE".green);

         model.create(req.body[name], function(err, new_instance) {
           if (err) console.log("ERROR!!!: ".red, err.message.red, "\n\n", err.stack.yellow, "\n\n");
           err ? res.send(Helpers.error("There was an error saving your object. " + err.message), 500) : res.send(new_instance);

           model.close();

         });

        return this;
        });

     },

     update: function(req, res) {

      /* { app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name } */
      ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name }, function(err, api_table) {
        if (!api_table) return res.send(Helpers.error("Couldn't find Table"), 404);

        var model = api_table.model(req.app);

        var name  = req.params.name;

        console.log("UPDATE".green);

        model.update(req.params.id, req.body[name], function(err, updated_instance) {
          err ? res.send(Helpers.error(err)) : res.send(updated_instance);
          model.close();
        });

        return this;
      });

    },

    destroy: function(req, res) {
      /* { app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name } */
      ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: req.params.name }, function(err, api_table) {
        if (!api_table) return res.send(Helpers.error("Couldn't find Table"), 404);

        var model = api_table.model(req.app);

        model.del(req.params.id, function(err) {
          err ? res.send(Helpers.error(err)) : res.send(Helpers.success());
          model.close();
        });

        return this;
      });

    }

  };
};

exports.build = function() {
  return EndPointController.call(this);
};
