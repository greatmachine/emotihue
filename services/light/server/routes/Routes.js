var config = require('../app').config;
var router = require('../app').express.Router();
var Controller = require('../app').controllers.Controller;

/******************************************************/
/*** ENDPOINTS: UTIL **********************************/
/******************************************************/

/**
 * Get status of this service.
 */
router.get('/status/', function(req, res, next){
     Controller.getStatus(function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});


/******************************************************/
/*** ENDPOINTS: BRIDGE ********************************/
/******************************************************/

/**
 * Search for bridges available on the network
 */
router.get('/bridges/', function(req, res, next){
     Controller.searchForBridges(function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

/**
 * Get bridge info
 */
router.get('/bridge/', function(req, res, next){
     Controller.getBridge(function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

/**
 * Register user with bridge
 */
router.post('/bridge/user', function(req, res, next){
     Controller.registerUser(function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

/******************************************************/
/*** ENDPOINTS: LIGHT *********************************/
/******************************************************/

/**
 * Search for lights available on the network
 */
router.get('/lights/', function(req, res, next){
     Controller.getAllLights(function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

/**
 * Get light info
 */
router.get('/light/:lightId', function(req, res, next){
     Controller.getLight(req.params.lightId, function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

/**
 * Set light color
 */
router.post('/light/:lightId', function(req, res, next){
     Controller.setLightColor(req.params.lightId, req.body.rgb, function(err, results){
          if(err){
               return(next({statusCode: 500, error: err}));
          }
          return(res.json(results));
	});
});

module.exports = router;
