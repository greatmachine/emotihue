/**
 * Light service
 */

/** environment-specific settings */
if(typeof process.env.RUNMODE == 'undefined'){
	console.log('error', `FATAL ERROR: unknown runmode!`);
	process.exit(0);
}

request = require('request');
_ = require('underscore');
moment = require('moment');
fs = require('fs');
async = require('async');
express = require('express');
exports.express = express;
exports.controllers = {}
bodyParser = require('body-parser');
cors = require('cors');
qs = require('qs');

/** Set up config */
try{
	config = {
		name: 'light',
		version: 'v1',
		runmode: process.env.RUNMODE
	}
	let parsedConfig = require(`./config/${process.env.RUNMODE}.json`);
	for(let set in parsedConfig){
		config[set] = parsedConfig[set]
	}

} catch(err){
	console.log('error', `Unable to get configuration: ${err}`);
	process.exit(0);
}
exports.config = config;

/** setup express */
app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

/** setup models, controllers and routes */
Controller = require('./controllers/Controller');
exports.controllers.Controller = new Controller;
Routes = require('./routes/Routes');
app.use(`/`, Routes);

const https = require('https')
server = https.createServer({
	key: fs.readFileSync(config.ssl.key),
	cert: fs.readFileSync(config.ssl.cert)
}, app).listen(config.port)
console.log(`${config.name} running as ${config.runmode} on ${config.port}`);

/** HANDLE UNCAUGHT EXCEPTIONS */
process.on('uncaughtException', function(err) {
	console.log('error', "Uncaught exception!", err.stack);
	return;
});
