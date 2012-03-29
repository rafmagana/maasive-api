// # Pool

var Pool = function(size, clean) {
  this.pool = [];
  this.size = size;
  this.clean = clean;
};

Pool.prototype.set = function(key, obj) {
  this.pool.push(obj);
  this.pool[key] = obj;
  if (this.pool.length > this.size) {
    var self = this;
    var dirt = this.pool.splice(this.size, (this.pool.length - this.size));
    dirt.forEach(function(d) {
      self.clean(d);
    });
  }
};

Pool.prototype.get = function(key) {
  return this.pool[key];
};

module.exports = Pool;
