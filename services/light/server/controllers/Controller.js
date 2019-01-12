var config = require('../app').config;
var hue = require("node-hue-api");
var HueApi = require("node-hue-api").HueApi;
var convert = require('color-convert');

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

/******************************************************/
/*** BRIDGE *******************************************/
/******************************************************/

/**
 * Return authenticated API object
 */
Controller.prototype.hueApi = function(){
     return new HueApi(config.hue.bridge.ip, config.hue.bridge.username);
}

/**
 * Search for bridges
 */
Controller.prototype.searchForBridges = function(callback){
     hue.nupnpSearch(function(err, bridges){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, bridges));
     });
}

/**
 * Get bridge info
 */
Controller.prototype.getBridge = function(callback){
     this.hueApi().config(function(err, bridge){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, bridge));
     });
}

/**
 * Register user on bridge
 */
Controller.prototype.registerUser = function(callback){
     //uses module (HueApi), not auth'd class (hueApi)
     HueApi().registerUser(config.hue.bridge.ip, function(err, user){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, user));
     });
}

/******************************************************/
/*** LIGHT ********************************************/
/******************************************************/

/**
 * Get all lights
 */
Controller.prototype.getAllLights = function(callback){
     this.hueApi().lights(function(err, lights){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, lights));
     });
}

/**
 * Get light by ID
 */
Controller.prototype.getLight = function(lightId, callback){
     this.hueApi().lightStatus(lightId, function(err, light){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, light));
     });
}

/**
 * Set light color
 */
Controller.prototype.setLightColor = function(lightId, rgb, callback){
     var self = this;

     async.waterfall([_convertColor, _setLightState], function(err, results){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, results));
     });

     /**
      * Convert RGB to hue-consumable object
      */
     function _convertColor(_cb){
          var hsb = convert.rgb.hsv(rgb.r, rgb.g, rgb.b);

          //convert hsb to hue space
          var colorState = {};
          colorState.hue = Math.round(hsb[0] * 182.04);
          colorState.sat = Math.round((255 * hsb[1]) / 100);
          colorState.bri = Math.round((255 * hsb[2]) / 100);

          return(_cb(false, colorState));
     }

     /**
      * Wrapper for setting light state
      */
     function _setLightState(colorState, _cb){
          self._setLightState(lightId, colorState, _cb);
     }
}

/**
 * Directly control light state
 */
Controller.prototype._setLightState = function(lightId, state, callback){
     this.hueApi().setLightState(lightId, state, function(err, light){
          if(err){
               console.log(err);
               return(callback(err));
          }
          return(callback(false, light));
     });
}

/******************************************************/
/*** BRIDGE *******************************************/
/******************************************************/


module.exports = Controller;
