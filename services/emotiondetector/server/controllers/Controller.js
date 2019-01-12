var config = require('../app').config;

function Controller(){

}


/******************************************************/
/*** STATUS *******************************************/
/******************************************************/

/**
 * Get current status of self and all services
 */
Controller.prototype.getStatus = function(callback){
     var self = this;

     var status = {
		serviceName: config.name,
		version: config.version,
		runmode: config.runmode,
		timestamp: moment.utc().format(),
	}

     return(callback(false, status));
}

module.exports = Controller;
