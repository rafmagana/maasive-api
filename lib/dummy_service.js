// # Dummy Service
function DummyService(){
  var self = this;

  self.id = 1;
  self.title = "My Dummy Service";
  self.subtitle = "Wtvr";
  self.account_id = 1;
  self.cached_slug = "my-dummy-service";
  self.base_url = "localhost";
  self.base_port = 3333;
  self.beta_level = 100;
  self.service_key = "10b61b618c6d1e788bd7d2d7ab9f2c13dfc2e2f1f06e167cedf71ee1a868";

  this.connection = {
                      'client_key':'ac1dc0682413560b8d035e',
                      'encrypted_client_secret':'1bU64vqBltkZh/blD7QEnZJiN/XNb/2rY4vMi5b8rVRCUtghzcu4gkp7IL0A3CcZl8ZMdl5knwb4AIeiBDSHuFk0TDgEt5ldvYpOvclPoeg=',
                      'salt': '07b4f8f24fc50d53aa7eaa95b579c667edb06e9a5686662f63297460147455719e2734a28614f2d9166bd6fbf8d028471fb8',
                      'connected': 1
                    }
  this.run = function(){
    // run!
  }

}

module.exports = DummyService();
