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

module.exports = router;
