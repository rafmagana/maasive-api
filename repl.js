// # Application console (REPL)

// To ineractively run commands in the MaaSive API app context run this  
//
//     $ node repl.js
//     mass (development)>
//  
//  or
//
//     $ make console
//     mass (development)>
//
//  or
//
//
//     $ NODE_ENV=test make console
//     mass (test)>
require('./env');

repl = require("repl");
context = repl.start("maas ("+ENV+")> ").context

