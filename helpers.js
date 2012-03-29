// # Helpers

// Constructor
function Helpers(){

    var self = this;

    // ## Encryption and decryption

    // This value was extracted from [MaaSive Web's Devise.pepper](https://github.com/elc/maasive-web/blob/master/config/initializers/devise.rb#L57)
    self.pepper = "bd80b6767b06446df647edc13243e7c4b68fbe915282c547894ece6819a6bc70411fe61fadfc6b1efaeb835886f7e28b0c72658f68e2b2bcda0feb15901278a7";

    // Initialization vector
    var iv = '0b16198be3f2e812';

    // Algorithm to encrypt/decrypt strings
    var algorithm = 'aes-128-cbc';

    // Set of characters that joins the two parts of a cookie
    var cookie_splitter = '--';

    // ### Decrypt
    // Used to decrypt the _\_app\_token_ cookie and authenticate requests  
    // The app's secret\_key is encrypted in [MaaSive Web](https://github.com/elc/maasive-web)  
    // in [config/initializers/maasive_web_encrypt.rb](https://github.com/elc/maasive-web/blob/master/config/initializers/maasive_web_encrypt.rb#L39)
    this.decrypt = function (encrypted_base64_string, salt) {

      var key = self.generateSHA1(self.spices(salt)).slice(0,16);

      var binary_encrypted_string = self.binarizeBase64(encrypted_base64_string);

      return self.decipheriv(binary_encrypted_string, key);
    }

    // ### Generate cookie
    // Generates a valid cookie
    this.generateCookie = function(app_id, base64_app_identifier, secret_key){
      var head = base64_app_identifier;
      var tail = self.generateSHA1(app_id + base64_app_identifier + secret_key);
      var cookie = head + cookie_splitter + tail;
      return cookie;
    }

    // ### isCookieValid
    this.isCookieValid = function(cookie, app_id, secret){
      var parts = cookie.split(cookie_splitter);
      var checksum = self.generateSHA1(app_id + parts[0] + secret);
      var result = false;
      if ( checksum === parts[1] ){
        result = true;
      }
      return result;
    }

    // ### GenerateSHA1
    this.generateSHA1 = function(string){
      var shasum = crypto.createHash('sha1');
      shasum.update(string);
      return shasum.digest('hex');
    }

    // ### DecipherIV
    // Deciphers string encrypted with a initialization vector
    this.decipheriv = function(encrypted_string, encryption_key){
      var decipher = crypto.createDecipheriv(algorithm, encryption_key, iv);
      var decrypted_string = decipher.update(encrypted_string, 'binary', 'binary');
      decrypted_string     += decipher['final']('binary');
      return decrypted_string;
    }

    // ### Binarize Base64 
    this.binarizeBase64 = function(string){
      return new Buffer(string, 'base64').toString('binary');
    }

    // ### Spices
    this.spices = function(salt){
      return salt + self.pepper;
    }

    // ## Response objects
    // Generates JSON objects used as HTTP responses
    
    // ### Sucesss
    this.success = function(custom_object){
      var response = { 'success': true };
      _.extend(response, custom_object);
      return response;
    }

    // ### Error
    this.error = function(error_message){
      var response = self.success();
      response.success = false;
      if ( error_message)
        _.extend(response, {'error' : error_message });
      return response;
    }
}

module.exports = new Helpers();
