// # Dummy App

var url      = require('url');
var _        = require('underscore')._;
var request  = require('request');
var colors   = require('colors');
var Pool     = require('./pool');
var dummy_service  = require('./dummy_service');

var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb/lib/mongodb/bson/bson').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON;

function App(){

  var self = this;

  // Data encrypted with IV=0b16198be3f2e812
  self.identifier = 'b4dddaf1465123f0829c2a6a40';
  self.secret_key = '4b238246e31705900849b609a0b8d7c7fbf12acd662a125dd5777ec53ea536';
  self.encrypted_secret_key = 'B3olloMyfl3aBXZq60Jkc8tjdXcvuvpg5akjOMz8/nFlgDV5d3cmFPxu8WehcsLKd8TN4FVhFWmkIgAGYkOAEA==';
  self.name = 'ELC Technologies';
  self.salt = '20ef13251e0e474f9192bbded2b6efc54b5773eb36f82ba1b1a9a60fb1089dbd1d860b626367e4683426b029feb3e2ea5f35';
  self.cookie = 'eyJhcHBfaWRlbnRpZmllciI6ImI0ZGRkYWYxNDY1MTIzZjA4MjljMmE2YTQwIn0=--df68d190ceafbba94edebdabe948ed92faf5a04b';
  self.object_id = new ObjectID();

  this.api_table = {
                    'name': 'MyClass', 
                    'version_hash': 'f1a7fc134389fa031abce8'
  };

  this.schema = { 'name' : 'String', 'age' : 'Integer' };

  this.service = dummy_service;

  function common_url(extra){
    if ( !extra )
      extra = '';

    return "/apps/" + self.identifier + "/versions/" + self.api_table.version_hash + extra + ".json";
  }

  function create_mysql_db(){
      mysql.connect(function(err, result) {

        if (err)
          return console.log("ERROR:".red, err);

        mysql.query('TRUNCATE TABLE apps');
        mysql.query("INSERT INTO `apps` VALUES (1,'App1','"+self.identifier+"',1,'"+self.encrypted_secret_key+"','"+self.salt+"',NOW(),NOW(),NULL,'127.0.0.1',27019);");

        //mysql.query('TRUNCATE TABLE services');
        //mysql.query("INSERT INTO `services` VALUES(1, '"+self.service.title+"', '"+self.service.account_id+"', '"+self.service.subtitle+"', 'NOW()', 'NOW()', '"+self.service.cached_slug+"', '"+self.service.base_url+"', '"+self.service.beta_level+"', '"+self.service.service_key+"')");

        //mysql.query('TRUNCATE TABLE service_connections')
        //mysql.query("INSERT INTO `service_connections` VALUES(1, 1, '"+self.service.id+"', '"+self.service.connection.client_key+"', '"+self.service.connection.encrypted_client_secret+"',  '"+self.service.connection.salt+"', 'NOW()', 'NOW()', '"+self.service.connection.connected+"')");

        console.log('Dummy data created in mySQL'.green);

      });

  }

  function setup_mongo_dbs(){
    mongoose.connection.db.dropDatabase(function(){
      console.log("Mongo maasive_api_test DB has been cleaned up...".green);

      var db = new Db(self.identifier, new Server("localhost", 27019,{auto_reconnect: false, poolSize: 4}), {native_parser: false});

      db.open(function(err, db){
        db.dropDatabase(function(err, done) {
          db.addUser(self.identifier, self.secret_key, function(err, result){
            console.log('Mongo database for dummy app has been created...'.green);
          });
        });
      });
    });
  }

  this.setup_dbs = function(){
    create_mysql_db();
    setup_mongo_dbs();
  }

  // Api Tables
  self.create_api_table_url = common_url();

  this.create_api_table_params = function(){
    var params = {};
    var schema_wrapper = {};
    schema_wrapper[self.api_table.name] = self.schema;
    params[self.api_table.version_hash] = schema_wrapper;
    return params;
  }
  
  // EndPoints
  //// Create
  self.create_endpoint_url = common_url('/'+self.api_table.name);

  this.create_endpoint_params = function(custom_values, age){
    var params = {};
    var new_age = 10;
    if ( age ){
      new_age = age;
    }
    var doc = {'name': 'elc', 'age': new_age};
    if ( custom_values )
      _.extend(doc, custom_values);
    params[self.api_table.name] = doc;
    return params;
  }

  this.create_endpoint_with_null_params = function(){
    params = self.create_endpoint_params();
    params[self.api_table.name]['age'] = null;
    return params;
  }

  self.query_endpoint_url = common_url('/'+self.api_table.name+'/query');
  self.count_endpoint_url = common_url('/'+self.api_table.name+'/count');
  self.update_endpoint_url = common_url('/'+self.api_table.name+'/'+self.object_id);
  self.delete_endpoint_url = self.update_endpoint_url;

  this.update_endpoint_params = function(){
    var params = {};
    params[self.api_table.name] = {'name': 'pdx', 'age': 25};
    return params;
  }

}

module.exports = App;
