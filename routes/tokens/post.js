/**
 * Tokens method - POST handler
 * 
 * Used for generating new auth token/renew token pairs. This individual route
 * method handler will issue both in a single response so that the requesting
 * client may begin using the authentication straight away.
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */
var aud = process.env.API_SERVER_AUDIENCE || 'http://localhost:8000';
var authModel = require('../../models/auth.js');

/**
 * POST Route handler
 * 
 * This method is used by an Express.js POST route to issue a new renewal token
 * along with a corresponding auth token for immediate use. The resulting token
 * pair must be implemented by the client for refreshing the token and supplied
 * to API endpoints where pertinent.
 */
function tokensPost(req, res, next) {
    var apiKey = req.body['api-key'],
        apiKeySecret = req.body['api-key-secret'];
        
    createRenewToken(apiKey, apiKeySecret)
        .then(renewAuthToken)
        .then(bundleTokens)
        .catch(tokenGenerationErrorRes);
}

/**
 * Issues a new Promise object that works to create a JWT string based on the
 * API key and secret provided.
 * @param {string} apiKey   (Optional) API key against which the issued token
 *                          should be authenticated.
 * @param {string} apiKeySecret (Optional) API key secret that corresponds to
 *                              the API key (if used).
 * @return {Promise}    Returns a Promise object that may be chained or caught
 *                      for future use.
 */
function createRenewToken(apiKey, apiKeySecret) {
    return new Promise(
        function (resolve, reject) {
            
            authModel.createRenewToken(
                apiKey,
                apiKeySecret,
                undefined,
                createTokenCallback
            );
            
            function createTokenCallback(err, token) {
                if (err) return reject(err);
                return resolve(token);
            }
        }
    );
}

/**
 * Issues a new Promise object that will create a new auth token from an valid
 * renwal token.
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

module.exports = tokensPost;