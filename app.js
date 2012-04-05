// # Main application

// ## Requires

// Require environment-specific configuration ([env.js](env.html))
require('./env');

// Require the [express framework](http://expressjs.com/)
var express = require('express');

// Export Application
var app = module.exports = express.createServer(express.logger());

// ## Setup application

// Helper to connect to necessary databases
app.connect_dbs = function() {

  // Connect to [mySQL](https://github.com/felixge/node-mysql)
  mysql.connect(function(err, result) {
    if (err) return console.log("ERROR:".red, err);
    return console.log("Success".green,"connected".grey, "MySql".yellow);
  });

  // Connect to [MongoDB](https://github.com/christkv/node-mongodb-native) with [Mongoose](http://mongoosejs.com/)
  mongoose.connect(global.mongo_url, function(err) {
    if (err) return console.log("ERROR:".red, err.message, err.stack);
    return console.log("Success".green,"connected".grey, "Mongo".blue);
  });
};

// Configure [Connect](http://www.senchalabs.org/connect/) middlewares
app.configure(function(){  
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    /* app.use(express.session({ secret: "mo email yo" })); */
    app.use(app.router);
});

// ## Configure environments

// ### Development
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// ### Staging
app.configure('staging', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// ### Production
app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express['static'](__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// ### Test
app.configure('test', function(){

  // Dummy application to run the tests against
  global.DummyApp = require('./lib/dummy_app');


  // Setup databases  
  // It's used in test/api\_endpoints\_spec.js
  app.get('/populate',
    AppController.debugRequest,
    AppController.populate);

});

// # MaaSive API routes

// ## Authentication

// Our authentication is done via the *\_app\_token* cookie.  
// *\_app\_token* has two parts:  
//
// 1. Base64 encoded json object
// 2. Signed SHA1 of the Base64 encoded json object

// ### Building the cookie

// Base64 encoded json object should at least include the *app_identifier*:
//
//     {"app_identifier" : "123abc"}
//
// which is then Base64 encoded:  
//
//     eyJhcHBfaWRlbnRpZmllciI6IjEyM2FiYyJ9
//
// The signed SHA1 consists of the identifier, base64 json and secret_key  
//
//     123abceyJhcHBfaWRlbnRpZmllciI6IjEyM2FiYyJ9secret
//
// which is then SHA1ed:  
//
//     e5f15176ea9ecebde70150f0001ea4f157e53662
//
// Now we put it all together and join it with a "--". Our resulting cookie value is:  
//
//     eyJhcHBfaWRlbnRpZmllciI6IjEyM2FiYyJ9--e5f15176ea9ecebde70150f0001ea4f157e53662

// ## API Tables

  // ### Create (POST)
  // #### Parameters
  // * app_id
  // * version_hash
  // * schema
  // * Schema structure

  //      { version_hash_value: 
  //          {
  //              api_table_name: 
  //                    { document_schema }
  //          }
  //       }

  // #### Results (Object)
  //     { success: true }
  // #### Example
  //     POST http://server  
  //         /apps/b48f.../versions/f1a7fc134389fa031abce8.json
  //
  //     {
  //       "f1a7fc134389fa031abce8":
  //          {
  //              "MyModel":
  //                {'name':'String', 'age': 'Integer'}
  //          }
  //     }

  app.post('/apps/:app_id/versions/:version_hash.json',
    AppController.debugRequest,
    AppController.authenticateApp,
    ApiTablesController.create);

    // ## EndPoints
    
    // ### Index (GET)
    // #### Parameters
    // * app_id
    // * version_hash
    // * name (ApiTable - class provided by Obj-C, Java or C#)

    // #### Optional parameters
    // * conditions
    //     - .eql
    //     - .gt
    //     - .lt
    //     - .gte
    //     - .lte
    //     - .regexp
    //     - .in

    // #### Results (Array of objects)
    //     { 
    //       results: 
    //          [ { MyModel: object },
    //            { MyModel: object },
    //            { MyModel: object } ] 
    //     }
    // where 'object' has this structure
    //
    //      {
    //        _id: '4f6d020233010a3ee2000001',
    //        attr1: value, \
    //        attr2: value,  |-- ApiTable's schema
    //        attrN: value, /
    //        created_at: 1332544008105,
    //        updated_at: 1332544008105 
    //      }
    
    // #### Example without attributes
    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc.../MyModel.json
    
    // #### Examples with attributes
    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc...
    //      /MyModel.json?attribute.eql=value
    
    // with parameters in the request's body

    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc...
    //      /MyModel.json
    //
    //      {
    //         'attribute.gt': 'value'
    //      }

    app.get('/apps/:app_id/versions/:version_hash/:name.json', 
      AppController.debugRequest,
      AppController.authenticateApp,
      AppController.logAnalytic,
      EndPointController.index);

    // ### Query (POST)
    // This is a POST version of Index (GET) 
    // #### Example without attributes
    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc.../MyModel/query.json

    // #### Examples with attributes
    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc...
    //      /MyModel/query.json?attribute.eql=value
    //
    // with parameters in the request's body
    //
    //     GET http://server
    //      /apps/b48fab.../versions/f1a7fc...
    //      /MyModel/query.json
    //
    //      {
    //         'attribute.gt': 'value'
    //      }
    //

    app.post('/apps/:app_id/versions/:version_hash/:name/query.json', 
      AppController.debugRequest,
      AppController.authenticateApp,
      AppController.logAnalytic,
      EndPointController.index);


    // ### Count (GET)
    // #### Parameters
    // * app_id
    // * version_hash
    // * name (ApiTable - class provided by Obj-C, Java or C#)

    // #### Results (Object)
    //     { count: number_of_documents }

    // #### Example
    //     GET http://server
    //        /apps/b48fab.../versions/f1a7fc...
    //        /MyModel/count.json

    app.get('/apps/:app_id/versions/:version_hash/:name/count.json', 
      AppController.debugRequest, 
      AppController.authenticateApp, 
      AppController.logAnalytic,
      EndPointController.count);

    // ### Count (POST)
    // This is a POST version of Count (GET)
    // #### Parameters
    // * app_id
    // * version_hash
    // * name (ApiTable - class provided by Obj-C, Java or C#)

    // #### Results (Object)
    //     { count: number_of_documents }

    // #### Example
    //     POST http://server
    //        /apps/b48fab.../versions/f1a7fc...
    //        /MyModel/count.json

    app.post('/apps/:app_id/versions/:version_hash/:name/count.json', 
      AppController.debugRequest, 
      AppController.authenticateApp, 
      AppController.logAnalytic,
      EndPointController.count);

    // ### Create (POST)
    // #### Parameters
    // * app_id
    // * version_hash
    // * name (ApiTable - class provided by Obj-C, Java or C#)
    // * attributes

    // #### About _id
    // it must be a BSON object, [here's the specification](http://www.mongodb.org/display/DOCS/Object+IDs#ObjectIDs-BSONObjectIDSpecification)

    // #### Results (Object)
    //      {
    //        _id: '4f6d020233010a3ee2000001',
    //        attr1: value, \
    //        attr2: value,  |-- ApiTable's schema
    //        attrN: value, /
    //        created_at: 1332544008105,
    //        updated_at: 1332544008105 
    //      }

    // #### Example without offline _id
    //     POST http://server
    //      /apps/b48fab.../versions/f1a7fc.../MyModel.json
    //      
    //      {
    //        'name': 'ELC',
    //        'age' : 10
    //      }

    // #### Example with offline _id
    //     POST http://server
    //      /apps/b48fab.../versions/f1a7fc.../MyModel.json
    //      
    //      {
    //        '_id' : '4f6d020233010a3ee2000001',
    //        'name': 'ELC',
    //        'age' : 10
    //      }

    app.post('/apps/:app_id/versions/:version_hash/:name.json', 
      AppController.startProfiling,
      AppController.debugRequest,
      AppController.authenticateApp,
      AppController.logAnalytic,
      EndPointController.create);


  // ### Update (PUT)
  // #### Parameters
  // * app_id
  // * version_hash
  // * name (ApiTable - class provided by Obj-C, Java or C#)
  // * id (_id of a returned object)

  // #### Results
  // The fact that created_at and update_at are different tell us that the object has been updated  
  // 
  //      {
  //        _id : '4f6d020233010a3ee2000001',
  //        attr1: new_value, \
  //        attr2: new_value,  |-- ApiTable's schema
  //        attrN: new_value, /
  //        created_at: 1332548740712,
  //        updated_at: 1332548744644
  //      }
  
  // #### Example
  // Let's say we want to edit the following document  
  //  
  //      {
  //        _id : '4f6d020233010a3ee2000001',
  //        name: 'ELC',
  //        age: 25,
  //        created_at: 1332548740712,
  //        updated_at: 1332548740712
  //     }
  
  // The request would be
  // 
  //      PUT http://server/apps/b48fab.../versions/f1a7fc...
  //        /MyModel/4f6d020233010a3ee2000001.json
  //      
  //      {
  //        'name': 'ELC Technologies',
  //        'age': 10
  //      }
  //      

  app.put('/apps/:app_id/versions/:version_hash/:name/:id.json', 
    AppController.debugRequest, 
    AppController.authenticateApp, 
    AppController.logAnalytic,
    EndPointController.update);
  
  // ### Delete (DELETE)
  // #### Parameters
  // * app_id
  // * version_hash
  // * name (ApiTable - class provided by Obj-C, Java or C#)
  // * id (_id of a returned object)

  // #### Results (Object)
  //      { success: true }

  // #### Example
  // Let's say we want to delete the following document  
  //  
  //      {
  //        _id : '4f6d020233010a3ee2000001',
  //        name: 'ELC',
  //        age: 25,
  //        created_at: 1332548740712,
  //        updated_at: 1332548740712
  //     }

  // The request would be
  // 
  //      DELETE http://server/apps/b48fab.../versions/f1a7fc...
  //        /MyModel/4f6d020233010a3ee2000001.json
  //

  app.del('/apps/:app_id/versions/:version_hash/:name/:id.json', 
    AppController.debugRequest, 
    AppController.authenticateApp, 
    AppController.logAnalytic,
    EndPointController.destroy);

  // ## Services

  /* this routes should be removed. need .json */
  app.post("/apps/:app_id/services/:service_id/service_connections/run", 
    AppController.debugRequest, 
    AppController.authenticateApp,
    ServiceController.run);
  app.post("/apps/:app_id/services/:service_id/service_connections/run.json", 
    AppController.debugRequest, 
    AppController.authenticateApp,
    ServiceController.run);

// ## Base routes

// The root of the server
app.get('/', function(req, res) {
  res.send('MaaSive API');
});

// Just a helper to know if the server is alive
app.get('/are/you/alive', function(req, res) {
  res.send(Helpers.success());
});
