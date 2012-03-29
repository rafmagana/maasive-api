// # API

// A namespace to hold some API-specific values
var API = function(){}

// ### Configuration
API.config = {};

// ### Supported data types
API.SUPPORTED_DATA_TYPES  = ['Float', 'String', 'Integer', 'Boolean', 'Date', 'EncryptedString'];

// ### Supported [MongoDB conditional operators](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-RetrievingaSubsetofFields)
API.SUPPORTED_CONDITIONAL_OPERATORS = ["gt", "gte", "lt", "lte", "ne"];

// ### Timestamp columns
API.TIMESTAMP_COLUMNS     = ['created_at', 'updated_at'];

// ### Internal columns
API.INTERNAL_COLUMNS       = ['_id', '_deleted'];

module.exports = API;
