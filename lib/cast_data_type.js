// # Cast data types

// Cast supported data types or cast a value depending on the column name

// ## Supported data types 
// Refer to lib/api.js to see the supported data types

// ## Supported columns
// Refer to lib/api.js to see the supported columns
// * Special columns
// * Timestamp columns

// Constructor
var CastDataType = function(){}

// ## Supported data types
//

// #### Float
CastDataType.Float = function( value ) {
  return parseFloat(value);
}

// #### String
CastDataType.String = function( value ) {

  var result = null;

  result = ( value == null ) ? '' : value;

  return result.toString();

}

// #### Integer
CastDataType.Integer = function( value ) {
  return parseInt( value, 0 );
}

// #### Boolean
CastDataType.Boolean = function( value ) {
  return Boolean( value );
}

// #### Date
CastDataType.Date = function( value ) {
  return new Date(this.Integer( value ));
}

// #### Encrypted String
CastDataType.EncryptedString = function( value ) {
  /* 
    var shasum = crypto.createHash('sha1');
    shasum.update(endpoint.app.identifier + raw + endpoint.app.secret);
    return shasum.digest('hex');
  */
  return CastDataType.String(value);
}

// ## Database columns to cast

// #### _id
CastDataType._id = function(value) {
  var BSON = require('mongodb').BSONPure;
  return new BSON.ObjectID(value);
}

// #### _deleted
CastDataType._deleted = function(value) {
  CastDataType.Boolean(value);
}

// #### created_at
CastDataType.created_at = function(value) {
  CastDataType.Date(value);
}

// #### updated_at
CastDataType.updated_at = function(value) {
  CastDataType.Date(value);
}

// ## Helper functions

// #### Cast data types based on the type or column name and value
CastDataType.cast = function( type, value ) {
  cast_value = value;

   if ( CastDataType.hasOwnProperty( type ) )
  {
    cast_value = CastDataType[type]( value );
  }
  return cast_value;
}

module.exports = CastDataType;
