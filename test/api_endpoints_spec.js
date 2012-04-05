process.env.NODE_ENV = 'test';

require('../env');
require('should');

var APIeasy = require('api-easy'),
    App = require('../lib/dummy_app');

var app = new App();
var testing_doc_age = app.create_endpoint_params()[app.api_table.name]['age'];
var topic = app.create_endpoint_params()[app.api_table.name];
var success = { "success" : true };

var suite = APIeasy.describe('MaaSive API');

suite.use('localhost', 3001)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Cookie', '_app_token=' + app.cookie)
      //
      .get('/populate')
        .expect(200, success).next().undiscuss()
        .expect('should populate the DBs', function(err, res, body){
        }).next()
      //
      .discuss('ApiTables - ')
      .post(app.create_api_table_url, app.create_api_table_params())
        .expect(200, success)
        .expect('should create the Api Table called ' + app.api_table.name, function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.success.should.be_true;
        }).undiscuss().next()
      //
      .discuss('EndPoints - ')
      .discuss('create with offline ids')
      .post(app.create_endpoint_url, app.create_endpoint_params({'_id': app.object_id}, 5))
        .expect(200)
        .expect('should return the new document with offline id', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property("name", topic.name);
          parsed_body.should.have.property("age", 5);
          parsed_body._id.should.equal(app.object_id.toString());
        }).undiscuss().next()
      //
      .discuss('create with offline malformed _id')
      .post(app.create_endpoint_url, app.create_endpoint_params({'_id': 'invalid _id'}))
        .expect(500).undiscuss().undiscuss().next()
      //
      .discuss('create without _id')
      .post(app.create_endpoint_url, app.create_endpoint_params())
        .expect(200)
        .expect('should return the json representation of the new document', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property("name", topic.name);
          parsed_body.should.have.property("_id")
        }).undiscuss().next()
      //
      .discuss('create with nil values')
      .post(app.create_endpoint_url, app.create_endpoint_with_null_params())
        .expect(200)
        .expect('should return a valid document', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property("name", topic.name);
          parsed_body.should.have.property("age", null);
        }).undiscuss().next()
      //
      .discuss('index')
      .discuss('listing without parameters')
      .get(app.create_endpoint_url)
        .expect(200)
        .expect('should return all the documents saved in database', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.results.should.have.length(3);
        }).undiscuss().next()
      //
      .discuss('querying')
      .get(app.create_endpoint_url, {'age.eql': 10})
        .expect(200)
        .expect('should respect the eql operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
          parsed_body[0][app.api_table.name].should.have.property("name", topic.name);
        }).next()
      //
      .get(app.create_endpoint_url, {'age.gt': 9})
        .expect(200)
        .expect('should respect the gt operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).next()
      //
      .get(app.create_endpoint_url, {'age.lt': 11})
        .expect(200)
        .expect('should respect the lt operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
        }).next()
      //
      .get(app.create_endpoint_url, {'age.gte': 9})
        .expect(200)
        .expect('should respect the gte operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).next()
      //
      .get(app.create_endpoint_url, {'age.lte': 10})
        .expect(200)
        .expect('should respect the lte operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
        }).next()
       .get(app.create_endpoint_url, {'age.ne': 10})
        .expect(200)
        .expect('should respect the ne operator', function(err, res, body){
           var parsed_body = JSON.parse(body).results;
           parsed_body.should.have.length(2);
        }).next()
      //
      .get(app.create_endpoint_url, {'name.regexp': '/el/i'})
        .expect(200)
        .expect('should respect the regexp operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
        }).next()
      //
      .get(app.create_endpoint_url, {'_id.in': app.object_id+","+app.object_id})
        .expect(200)
        .expect('should respect the in operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).undiscuss().next()
      //
      .discuss('sorting')
      .get(app.create_endpoint_url, {'sort':'age'})
        .expect(200)
        .expect('should sort numbers', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
          parsed_body[1][app.api_table.name].should.have.property('age', 5);
          parsed_body[2][app.api_table.name].should.have.property('age', topic.age);
        }).next()
      //
      .get(app.create_endpoint_url, {'sort':'name'})
        .expect(200)
        .expect('should sort strings', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body[0][app.api_table.name].should.have.property('name', topic.name);
        }).undiscuss().next()
      //
      .discuss('limiting')
      .get(app.create_endpoint_url, {'limit':1})
        .expect(200)
        .expect('should sort strings', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).undiscuss().next()
      //
      .discuss('skipping')
      .get(app.create_endpoint_url, {'skip':1, 'sort':'age'})
        .expect(200)
        .expect('should skip the number of results given', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(2);
        }).undiscuss().undiscuss().next()
      //
      .discuss('query')
      .post(app.query_endpoint_url, {'age.eql':testing_doc_age})
        .expect('should respect eql operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).next()
      //
      .post(app.query_endpoint_url, {'age.gt':5})
        .expect('should respect gt operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).next()
      //
      .post(app.query_endpoint_url, {'age.lt':testing_doc_age})
       .expect('should respect lt operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(2);
        }).next()
      //
      .post(app.query_endpoint_url, {'age.gte': 5})
        .expect('should respect gte operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(2);
        }).next()
      //
      .post(app.query_endpoint_url, {'age.lte': testing_doc_age})
        .expect('should respect lte operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
        }).next()
      //
      .post(app.query_endpoint_url, {'name.regexp': '/el/i'})
        .expect('should respect regexp operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(3);
        }).next()
      //
      .post(app.query_endpoint_url, {'_id.in': app.object_id+","+app.object_id})
        .expect(200)
        .expect('should respect the in operator', function(err, res, body){
          var parsed_body = JSON.parse(body).results;
          parsed_body.should.have.length(1);
        }).undiscuss().next()
      //
      .discuss('count')
      .get(app.count_endpoint_url)
        .expect(200)
        .expect('should return the number of documents saved in the db', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 3);
        }).next()
      //
      .discuss('querying')
      //
      .get(app.count_endpoint_url, {'age.eql': testing_doc_age})
        .expect(200)
        .expect('should respect the eql operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 1);
        }).next()
      //
      .get(app.count_endpoint_url, {'age.gt': 5})
        .expect(200)
        .expect('should respect the gt operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 1);
        }).next()
      //
      .get(app.count_endpoint_url, {'age.lt': testing_doc_age})
        .expect(200)
        .expect('should respect the lt operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 2);
        }).next()
      //
      .get(app.count_endpoint_url, {'age.gte': 5})
        .expect(200)
        .expect('should respect the gte operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 2);
        }).next()
      //
      .get(app.count_endpoint_url, {'age.lte': testing_doc_age})
        .expect(200)
        .expect('should respect the lte operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 3);
        }).next()
      //
      .get(app.count_endpoint_url, {'name.regexp': '/el/i'})
        .expect(200)
        .expect('should respect the regexp operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 3);
        }).next()
      //
      .get(app.count_endpoint_url, {'_id.in': app.object_id+","+app.object_id})
        .expect(200)
        .expect('should respect the in operator', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('count', 1);
        }).undiscuss().undiscuss().next()
      //
      .discuss('update')
      .put(app.update_endpoint_url, app.update_endpoint_params())
        .expect(200)
        .expect('should update existing document and return the new json representation', function(err, res, body){
          var topic = app.update_endpoint_params()[app.api_table.name];
          var parsed_body = JSON.parse(body);
          parsed_body.should.have.property('name', topic.name);
          parsed_body.should.have.property('age', topic.age);
        })
        .expect('should not blow away if created_at is not given', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.should.not.equal(null);
        }).undiscuss().next()
      //
      .discuss('delete')
      .del(app.delete_endpoint_url)
        .expect(200)
        .expect('shoud create a deleted instance', function(err, res, body){
          var parsed_body = JSON.parse(body);
          parsed_body.success.should.be.true;
        }).undiscuss()
      .export(module);
