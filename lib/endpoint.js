// # EndPoint

// ## Requires

var request  = require('request');
var Pool     = require('./pool');
var CastDataType = require('./cast_data_type');

var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server,
  ReplServer = require('mongodb').ReplSetServers;

// Pagination
var PAGINATION = ["limit", "offset"];

// ## Query builder
var QueryBuilder = function( endpoint ) {

  // ### Type cast value
  // Cast received data type to one of the supported ones
  function type_cast_value( raw, for_key ) {

    var cast_type = null;

    // Check if the column is one of the special ones
    if ( for_key == '_id' || for_key == '_deleted' || API.TIMESTAMP_COLUMNS.indexOf( for_key ) > -1 ) {

      cast_type = CastDataType.cast( for_key, raw );

    } else if ( PAGINATION.indexOf(for_key) > -1 ) {

      cast_type = CastDataType.Integer( raw );

    }

    // Check if column's type is one of the supported ones
    if ( !cast_type ) {

      var type = endpoint.api_table.schema[for_key];
      cast_type = CastDataType.cast( type, raw );

    }

    return cast_type;
  }

  // ### Build subquery
  // Converts queries to something understandable by MongoDB
  //
  // For instance, if the API gets this:
  //
  //      attribute.gt = 5
  //
  // This functions returns:
  //
  //      { attribute : { $gt : 5 } }
  //
  function build_sub_query( query, key_array, value, last_key ) {

    var current_key = key_array.shift();

    if ( current_key == 'id' ) {
      current_key = '_id';
    }

    if (current_key) {

      if ( current_key == "regexp" ) {

        var parts = /^\/(.*)\/([^\/]*)$/.exec( value );

        query = parts ? RegExp(parts[1], parts[2]) : RegExp(value);

      } else if ( API.SUPPORTED_CONDITIONAL_OPERATORS.indexOf(current_key) > -1 ) {

        query['$'+current_key] = type_cast_value( value, last_key );

      } else if ( !!key_array.length ) {

        query[current_key] = query[current_key] || {};
        query[current_key] = build_sub_query( query[current_key], key_array, value, current_key );

      } else if ( current_key == "in" ) {

        if ( value ) {
          query["$in"] = _.map(value.split(","), function(v) { return type_cast_value(v, last_key); });
        } else {
          query["$in"] = [];
        }
      } else if ( current_key == 'eql' ) {

        query = type_cast_value(value, last_key);

      } else {

        query[current_key] = type_cast_value( value, current_key );

      }
    } else {

      query[current_key] = type_cast_value( value, current_key );

    }
    
    return query;
  }
  
  // ### Parse Sort
  // Parse the sort parameter
  function parseSort(string) {

    var parts = string.split(' '),
        obj   = {};

    direction = parts[1] || "asc";

    if ( direction.toLowerCase() == 'desc' ) {

      obj[parts[0]] = -1;

    } else {

      obj[parts[0]] = 1;

    }

    return obj;
  }

  // ### Build
  // Generates the parameters that will be used to query MongoDB
  function build( params ) {

    var query = {};
    
    var sort = params.sort ? parseSort(params.sort) : undefined;
    delete params.sort;
    
    var limit = params.limit ? parseInt(params.limit,0) : undefined;
    delete params.limit;
    
    var skip = params.skip ? parseInt(params.skip,0) : undefined;
    delete params.skip;
    
    _.each(params, function(value, k) {

      var key_array = k.split('.');
      query = build_sub_query(query, key_array, value);

    });
    
    return { query: query, params: { sort:sort, limit:limit, skip:skip } };
  }
  
  return { build: build };
};

// ## EndPoint constructor
function EndPoint( api_table, app ) {

  var self = this;
  
  this.api_table = api_table;
  this.app = app;
    
  this.table_name = this.api_table.app_id + "_" + this.api_table.name;
  
  this.connection_config = {
    hostname: this.app.mongo_host,
    port:     this.app.mongo_port,
    username: this.app.identifier,
    password: this.app.secret,
    db_name:  this.app.identifier
  };
  
  this.table_name = this.api_table.name;
  
  this.db =  new Db(this.connection_config.db_name, new Server(this.connection_config.hostname, this.connection_config.port, {}), {native_parser:false});
 
  console.log( "DATABASE".green, this.db.databaseName, this.db.serverConfig.host );

  this.qb = QueryBuilder(this);
  
  return this;

};

// ### Connnect
EndPoint.prototype.connect = function( fn ) {

  var self = this;

  if ( !self.collection ) {

    var next = function( err, db ) {
      if ( err ) {
        console.log( "Error On DB Open", err );
        fn( err, self.collection );
      } else {
        db.collection( self.table_name, function(err, collection ) {
          self.collection = collection;
          /* collection_pool[self.api_table._id] = self.collection; */
          fn( err, collection );
        });
      }
    };
  
    if ( self.db.state == 'notConnected' ) {

      self.db.open( function( err, db ) {

        if ( err ) return console.log("ERROR IN DB".red, err.message, err.stack);

        if ( self.connection_config.username ) {
          db.authenticate( self.connection_config.username, self.connection_config.password, function(e, replies ) {
            /* console.log("Authentication".red, replies); */
            next( e, db );
          });
        } else {

          next( err, db );

        }
      });

    } else {

      next( null, self.db );

    }
  } else {

    fn( null, self.collection );

  }
};

// ### Find
EndPoint.prototype.find = function( query, fn ) {

  var self = this;

  this.connect( function( err, collection ) {

    if ( err ) { return fn(err, null); }

    var q = self.qb.build( query );

    console.log("Query".green, q);

    self.collection.find( q.query, q.params, function( err, cursor ) {

      if ( err ) { return fn( err, null ); }

      var items = [];

      cursor.each( function( err, item ) {

        if ( err ) { return fn( err, null ); }

        if( !err ) {

          if ( item != null ) {

            var i = {}; i[self.api_table.name] = self.filterInstance( item );
            items.push( i );

          } else {

            fn( err, items );
            items = null;

          }
        }
        return true;

      });


      return this;

    });

    return true;

  });

};

// ### Count
EndPoint.prototype.count = function( query, fn ) {

  var self = this;
  
  this.connect( function( err, collection ) {

    if ( err ) return fn( err, null );

    var q = self.qb.build( query );

    console.log("Query", q);

    self.collection.count( q.query, function( err, count ) {

      fn( err, count );

    });

    return true;

  });

};

// ### Create
EndPoint.prototype.create = function( obj, fn ) {

  var self = this;

  if ( !obj ) return fn( err, null );
  
  this.connect( function( err, collection ) {

    if ( err ) return fn( err, null );
    
    try {

      var cleaned_instance = self.cleanInstance( obj );

    } catch( e ) {

      return fn( e, null );

    }

    cleaned_instance.created_at = new Date;
    cleaned_instance.updated_at = new Date;

    self.collection.insert( cleaned_instance, function( err, objects ) {

      var new_instace = self.filterInstance( objects[0] );
      fn( err, new_instace );

    });

    return true;

  });

  return true;

};

// ### Update
EndPoint.prototype.update = function( id, obj, fn ) {

  var self = this;

  this.connect( function( err, collection ) {

    if ( err ) return fn( err, null );

    var cleaned_instance = self.cleanInstance( obj );
    cleaned_instance.updated_at = new Date;

    console.log("updating", cleaned_instance);

    delete cleaned_instance._id

    console.log("Cleaned", cleaned_instance);

    collection.findAndModify( { "_id": CastDataType._id( id ) }, 
                              [['_id',1]], 
                              { $set: cleaned_instance },  
                              { 'new': true }, 
                              function( err, updated_doc ) {

      var updated_instance = self.filterInstance( updated_doc );
      fn( err, updated_instance) ;

    });

    return true;

  });

};

// ### Delete
EndPoint.prototype.del = function( id, fn ) {

  var self = this;
  
  this.connect( function( err, collection ) {

    if ( err ) return fn( err, null );
    
    attrs = { "$set" : { updated_at: new Date, "_deleted": true } };
    
    collection.update( { "_id": CastDataType._id( id ) }, attrs, function( err ) {

      fn( err );

    });
    
    return true;

  });

};

// ### Filter instance
EndPoint.prototype.filterInstance = function( obj ) {

  var self = this;
  
  _.each( obj, function( value, key ) {
    if ( API.INTERNAL_COLUMNS.indexOf(key) > -1 || API.TIMESTAMP_COLUMNS.indexOf(key) > -1 || self.api_table.schema[key] == 'Date' ) {

      if ( value ) {

        obj[key] = value.valueOf();

      } else {

        obj[key] = value;

      }
    } else if ( !self.api_table.schema.hasOwnProperty( key ) ) {

      delete obj[key];

    }

  });

  return obj;

};

// ### Clean instance
EndPoint.prototype.cleanInstance = function( instance ) {

  var self = this;
    
  _.each( instance, function( raw, key ) {

    var type = self.api_table.schema[key];
    
    if ( key === 'id' ) { key = '_id'; }

    if ( key === '_id' || key === '_deleted' || API.TIMESTAMP_COLUMNS.indexOf(key) > -1 ) {

      instance[key] = CastDataType[key]( raw );

    } else if (!type) {

      delete instance[key];

    } else if (API.SUPPORTED_DATA_TYPES.indexOf(type) > -1 ) {

      instance[key] = CastDataType[type]( raw );

    } else if (!raw) {

      delete instance[key];

    } else {

      instance[key] = raw;

    }

  });
  
  return instance;
};

// ### Close
EndPoint.prototype.close = function() {
  this.db.close();
};

exports.Instance = EndPoint;
