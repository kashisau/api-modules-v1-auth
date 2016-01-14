/**
 * Tokens method - PUT handler
 * 
 * Used to generate a short-lived auth token from a supplied renew token (once
 * the renew token supplied has been assessed for validity).
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */
var authModel = require('../../models/auth.js');

/**
 * PUT Route handler
 * 
 * This method is used by an Express.js PUT route to issue a new auth token 
 * corresponding to the supplied renew token.
 */
function tokenRefresh(req, res, next) { 
    
    validateRenewToken(req.auth.token)
        .then(renewAuthToken)
        .then(issueAuthToken)
        .catch(issueErrorResponse);

    res.header('content-type', 'application/vnd.api+json');
            
    /**
     * Uses the res object to issue a response to the client with the auth and
     * renewal tokens in place.
     */
    function issueAuthToken(authToken) {
        res.json({
            data : {
                auth: authToken
            }
        });
    }
    
    /**
     * Uses the res object to issue an error response to the client.
     */
    function issueErrorResponse(err) {
        res.status(err.httpStatus);
        var error = [{
            httpStatus: err.httpStatus,
            name: err.name,
            message: err.message
        }];
        
        
        res.json({
            errors : error
        });
    }

}

/**
 * Issues a new Promise object that validates a renew token for integrity and
 * checks for existence in the token revocation list.
 * @param {string} renewToken   The renewal token being validated.
 * @return {Promise}    Returns a Promise object that may be chained or caught
 *                      for future use.
 */
function validateRenewToken(renewToken) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.validateToken(
                renewToken,
                tokenValidationCallback
            );
            
            function tokenValidationCallback(err, token) {
                if (err) return reject(err);
                var renewPayload = authModel.decodeToken(renewToken);
                
                if (renewPayload.type !== "renew") {
                    var renewTokenError = new Error("The supplied token is " +
                        "the wrong token type.");
                        
                    renewTokenError.httpStatus = 401;
                    renewTokenError.name = "auth_token_type_invalid";
                    return reject(renewTokenError);
                }
                
                
                return resolve(renewToken);
            }
        }
    );
}

/**
 * Issues a new Promise object that will create a new auth token from an valid
 * renwal token.
 * @param {string}  The renew token from which the auth token should be issued.
 * @return {Promise}    Returns a Promise object that will issue a token or
 *                      report an error on completion.
 */
function renewAuthToken(renewToken) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.renewAuthToken(renewToken, renewalCallback);

            function renewalCallback(err, token) {
                if (err) return reject(err);
                return resolve(token);
            }
            
        }
    );
}

module.exports = tokenRefresh;