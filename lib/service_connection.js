// # Service connection

var crypto   = require('crypto');
var _        = require('underscore')._;
var request  = require('request');

function Instance(attributes, service_attributes) {
  this.attributes = attributes;
  this.service_attributes = service_attributes;
};

Instance.prototype.run = function(req, res) {
  var self = this;
  
  var params = _.extend(req.query, req.body);
  
  var uri = 'http://'+this.service_attributes.base_url+":"+this.service_attributes.base_port+'/maas/clients/'+this.attributes.client_key+'/commands/'+params['command']+".json";
  var headers = {};
  headers['Cookie'] = '_maas_token='+this.cookie_value();
  
  var opts = { method: 'POST'
    , uri: uri
    , headers: headers
    , json: params
  };
  
  request(
    opts
  , function (error, response, body) {
      if (error) {
        res.send(Helpers.error("Remote service is not responding."));
      } else if(response.statusCode == 200){
        res.send(body);
      } else {
        res.send(Helpers.error("Error with remote service."));
      }
    }
  );
  
};

Instance.prototype.sign_string = function(string) {
  var secret = this.secret_key();
  var shasum = crypto.createHash('sha1');
  shasum.update(string + this.attributes.client_key + secret);
  return shasum.digest('hex');
};

Instance.prototype.secret_key = function() {
  var pepper = "bd80b6767b06446df647edc13243e7c4b68fbe915282c547894ece6819a6bc70411fe61fadfc6b1efaeb835886f7e28b0c72658f68e2b2bcda0feb15901278a7";
  var spices = this.attributes.salt + pepper;

  var shasum = crypto.createHash('sha1');
  shasum.update(spices);
  var key = shasum.digest('hex').slice(0,16);

  var encrypted_string = new Buffer(this.attributes.encrypted_client_secret, 'base64').toString('binary');

  var decipher      =  crypto.createDecipheriv('aes-128-cbc', key, '0b16198be3f2e81282e694fdb60a92544378d6fe');
  var string        =  decipher.update(encrypted_string, 'binary', 'binary');
  string            += decipher['final']('binary');

  return string;
};

Instance.prototype.cookie_value = function() {
  var obj    = { client_key: this.attributes.client_key };
  var json   = new Buffer(JSON.stringify(obj));
  var json64 = json.toString('base64');
  var sha    = this.sign_string(json64);
  return json64 + "--" + sha;
};

exports.Instance = Instance;
