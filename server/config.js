const nconf = require('nconf');
const path = require('path');
const fs = require('fs');

//
// Setup our default configurations
//
const root = path.join(__dirname, '..', 'config.json');

nconf.argv();
nconf.env();

if (fs.existsSync(root)) {
  nconf.file({ file: root });
}

//
// Expose the pre-configured config.
//
module.exports = nconf;
