// # API Tables Controller

var ApiTablesController = function() { 
  
  return {

    // # Create
    create: function(req, res, next) {

      // ## Error handling
      // In order to create an Api Table we need to get the version_hash. table name and schema
      if (!req.body) return res.send(Helpers.error('Version could not be create. No information was given. Internal SDK Error.'));  

      var tables   = req.body[req.params.version_hash];
      if (!tables) return res.send(Helpers.error('Version could not be create. Internal SDK Error.'));

      var t_name   = Object.keys(tables)[0];
      if (!t_name) return res.send(Helpers.error('No table given. Internal SDK Error.'));

      var schema   = tables[t_name];
      if (!schema) return res.send(Helpers.error('No schema given. Internal SDK Error.'));
      
      // If we find an Api Table with the current parameters we don't create a new Api Table
      ApiTable.findOne({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: t_name }, function(err, obj) {
        if (obj) return res.send(Helper.success({notice: "already exists"}));

        try {
          var new_table = new ApiTable({ app_id: req.app.identifier, version_hash: req.params.version_hash, name: t_name });
          new_table.doc.schema   = schema;
          new_table.save(function(err) {
            res.send(Helpers.success());
          });
        } catch(e) {
          res.send(Helpers.error());
        }

      });

      return true;
    }
  
  };
};

exports.build = function() {
  return ApiTablesController.call(this);
};

