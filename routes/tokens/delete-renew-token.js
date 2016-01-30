/**
 * Tokens method - DELETE handler
 * 
 * Revokes a renew token, checking against the database after the revocation
 * proocess to confirm that the token no longer validates.
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */
var authModel = require('../../models/auth.js');

/**
 * DELETE Route handler
 * 
 * This method takes a 
 */
function tokenRevoke(req, res, next) {
    var token = req.params.token;

    // To check the supplied token we extract the JWT from the header.
    if (token !== undefined)
        if (token.toLowerCase() === "bearer") {
            var authHeader = req.headers['authorization'];
            token = authHeader
                .split("Bearer ")
                .filter((x) => x.length)
                .join("");
        }

    validateRenewToken(token)
        .then(revokeToken)
        .then(confirmRevocation)
        .then(reportRevocation)
        .catch(issueErrorResponse);

    res.header('content-type', 'application/vnd.api+json');
            
    /**
     * Uses the res object to issue a confirmation for the token revocation.
     */
    function reportRevocation(token) {
        res.json({
            data : {
                token: token,
                revoked: true
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
                        "the wrong token type (auth tokens cannot be " +
                        "revoked).");
                    renewTokenError.httpStatus = 422;
                    renewTokenError.name = "auth_token_type_invalid";
                    return reject(renewTokenError);
                }
                
                
                return resolve(renewToken);
            }
        }
    );
}

/**
 * Issues a Promise that fulfils the revokation using the authentication model
 * @param {string}  The renew token from which the auth token should be issued.
 * @return {Promise}    Returns a Promise object that will issue a token or
 *                      report an error on completion.
 */
function revokeToken(renewToken) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.revokeToken(renewToken, renewalCallback);

            function renewalCallback(err, token) {
                if (err) return reject(err);
                return resolve(renewToken);
            }

        }
    );
}


/**
 * Issues a Promise that uses the authentication model to confirm that a token
 * reports as invalid. This method will only resolve if the supplied token
 * triggers a validation error, specifically `renew_token_revoked`.
 * @param {string}  The renew token from which the auth token should be issued.
 * @return {Promise}    Returns a Promise object that will issue a token or
 *                      report an error on completion.
 */
function confirmRevocation(invalidatedRenewToken) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.validateToken(
                invalidatedRenewToken,
                invalidatedCallback
            );

            function invalidatedCallback(err, token) {
                if ( ! err) {
                    return reject(
                        () => {
                            var e = new Error("Token still validates.");
                            e.httpStatus = 500;
                            e.name = "renew_token_not_revoked";
                            return e;
                        }
                    );
                }
                if (err.name !== "renew_token_revoked") return reject(err);
                
                return resolve(invalidatedRenewToken);
            }
            
        }
    );
}

module.exports = tokenRevoke;