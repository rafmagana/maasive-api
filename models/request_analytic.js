// # Request analytic

// ## Requires

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')._
  , util = require('util')
;

// ## Define Mongoose schema
var RequestAnalytic = new Schema({
  app_id:          String,
  host:            String,
  timezone:        String,
  user_agent:      String,
  device_id:       String,
  device_name:     String,
  device_version:  String,
  created_at:      Date,
  epoc_created_at: Number,
  access_type:     String
});

// ## Hooks

// Pre save
RequestAnalytic.pre('save', function (next) {
    this.created_at      = (new Date);
    this.epoc_created_at = (new Date).valueOf() / 1000;
    next();
});

// ## Models

// Define RequestAnalytic model
mongoose.model('request_analytic', RequestAnalytic);


