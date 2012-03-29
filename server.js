// # Server (Cluster)

// ## Requires

// Require environment-specific configuration
require('./env');

var cluster = require('cluster');
var oldUmask = process.umask(0000);

// The actual application
var app = require('./app');

// ## Cluster

// Configure the cluster
cluster(app)
  .set('workers', API.config.workers || 1)
  .set('socket path', API.config['socket path'])
  .set('user', API.config.server_user)
  // Define middlewares
  ['in']('development')
  ['in']('staging')
    .use(cluster.debug())
    .use(cluster.pidfiles())
  ['in']('all')
    .listen(global.listening_to, function() {
      console.log('Listening to '.grey + global.listening_to.toString().blue);
    })
  // Listens to 'close' event, when fired cleans up pids/
  .on('close', function() {
    console.log('\nCleaning Up'.red);
    try {
      fs.readdirSync('pids').forEach( function(p) { fs.unlinkSync("pids/"+p); });
      console.log('Clean Up completed'.green);
    } catch(e) {
      console.log("No Clean up".yellow)
    }
  });
;

// Show feedback in console
if (!(process.env.CLUSTER_WORKER === undefined)) {
  process.umask(oldUmask);
  console.log('WORKER'.grey, process.env.CLUSTER_WORKER);
  app.connect_dbs();
} else {
  console.log('-------------------'.bold);
  console.log('M'.green.bold + 'aa'.blue + 'S'.green.bold + 'ive'.blue + "API".yellow, '-', ENV.bold.green);
  console.log('API ENDPOINT SERVER'.grey);
  console.log('© MaaSiveCO 2011'.yellow);
  console.log('-------------------'.bold);
};
