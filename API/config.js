var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

var file = 'network-config%s.json';

var env = process.env.TARGET_NETWORK;
if (env)
    file = util.format(file, '-' + env);
else
    file = util.format(file, '');

file = "network-config-bluemix.json"
hfc.addConfigFile(path.join(__dirname, 'app', file));
hfc.addConfigFile(path.join(__dirname, 'config.json'));