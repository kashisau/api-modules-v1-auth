/**
 * Auth request v1 Express Middleware
 * 
 * This middleware parses request information to provide latter middlewares and
 * routers in the Express chain with details of the request authentication
 * supplied.
 * 
 * If no authentication data is supplied then this middleware simply passes on
 * to the next handler without error. If there is an error in the supplied
 * request's authorisation data (or practices) then an error is raised.
 * 
 * @author Kashi Samarawaeera <kashi@kashis.com.au>
 * @version 1.0.0
 */

var express = require('express');
var router = express.Router();
var authModel = require('../models/auth.js');

router.use(
    function(req, res, next) {
        var authToken = req.get('auth-token')
                || req.get('authentication-token'),
            authError = new Error();

        // Check for JWT
        if (typeof(authToken) === "undefined") {
            authError.message = "There was no authentication token provided " +
                "with this request.";
            authError.name = "auth_token_missing";
            authError.httpStatus = 401;

            return next(authError);
        }
        
        // Validate JWT
        authModel.validateToken(
            authToken,
            tokenValidationCallback
        );

        function tokenValidationCallback (err, resullt) {
            if (err !== undefined) {
                err.httpStatus = 401;
                return next(err);
            }

            req.auth = req.auth || {};
            
            req.auth.token = authToken;
            req.auth.tokenPayload = authModel.decodeToken(authToken);
            
            req.auth.functions = require('../models/auth-functions.js');
    
            return next();
        }
    }
);

module.exports = router;