/**
 * Tokens method - GET handler
 * 
 * Takes an authorisation token of any type and provides some information about
 * the token including its validity.
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */
var authModel = require('../../models/auth.js');

/**
 * GET Route handler
 * 
 * This method is used by an Express.js GET route to run validation checks on 
 * a supplied token and provide feedback.
 */
function checkToken(req, res, next) { 
    var token = req.params.token;
    
    // To check the supplied token we extract  the JWT from the header.
    if (token !== undefined)
        if (token.toLowerCase() === "bearer") {
            var authHeader = req.headers['authorization'];
            token = authHeader
                .split("Bearer ")
                .filter((x) => x.length)
                .join("");
        }
    
    validateToken(token)
        .then(reportTokenPayload)
        .catch(issueErrorResponse);

    res.header('content-type', 'application/vnd.api+json');
            
    /**
     * Uses the res object to provide information about the supplied token.
     */
    function reportTokenPayload(token) {
        var payload = authModel.decodeToken(token);
        res.json({
            data: {
                token: payload,
                validity: true
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
            errors : error,
            data: {
                validity: false
            }
        });
    }

}

/**
 * Issues a new Promise object that validates a token for integrity. This 
 * method will take any type of token (either a renew token or accept token),
 * rejecting the promise if there is a validation issue with the token.
 * @return {Promise.<string>}   Returns a Promise object along with the token
 *                              supplied for further processing.
 */
function validateToken(tokenString) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.validateToken(
                tokenString,
                tokenValidationCallback
            );
            
            function tokenValidationCallback(err, token) {
                if (err) return reject(err);
                return resolve(tokenString);
            }
        }
    );
}

module.exports = checkToken;