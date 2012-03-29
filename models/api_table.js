// # API Table

// ## Requires
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')._
  , util = require('util')
  , EndPoint = require('../lib/endpoint').Instance
;

// ## Define Mongoose schema
var ApiTable = new Schema({
  // ### app_id
  // An hexadecimal string with length greater or equal to 10
  app_id          : String,

  // ### version_hash
  // Comma delimited list of _AttributeName:NormalizedType_ that has been SHA-1ed (with comma at the end).  // _NormalizedTypes_ are String and Float so far
  version_hash    : String,

  // ### name
  // Name of the class provided by Obj-C, Java, or C#
  name            : String,

  // ### version_id
  version_id      : String,

  // ### version_number
  version_number  : String,

  // ### created_at
  created_at      : Date,

  // ### updated_at
  updated_at      : Date
});

// ## Hooks

// Pre save
ApiTable.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date;
  this.updated_at = new Date;
  next();
});

// ## Mongoose methods

// ### Model
// The _model_ method is used to get the actual model linked to this api table
ApiTable.method("model", function(app) {
  model = new EndPoint(this.doc, app);
  return model;
});

// ## Helpers

// ### Serialize schema
// *NOTE:* This function is not used yet
function serialize_schema(schema_json) {
  _.each(schema_json, function(obj, key){
    if (obj === "String") {
      schema_json[key] = String;
    } else if (obj === "Integer") {
      schema_json[key] = Number;
    } else {      
      schema_json[key] = String;
    }
  });

  return schema_json;
}

// ## Models

// Define ApiTable model
mongoose.model('api_table', ApiTable);
