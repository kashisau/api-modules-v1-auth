/**
 * Auth model - functions
 * 
 * Used to supply the request object with methods that are common to the server
 * API.
 * 
 * @author Kashi Samaraweera
 * @version 0.1.0
 */
var authFunctions = (function() {
    
    var authReqAPI = {};
    
    /**
     * Handler for setting the minimum AccessLevel for the API method being
     * used. This will take the desired AccessLevel, along with the typical
     * routing parameters. This method will always return gracefully, with a
     * boolean value, however the supplied router parameters will be used to 
     * return a response if the minimum AccessLevel is not met.
     * @param {number} requiredAccessLevel  The desired AccessLevel for the
     *                                      method being requested. 
     * @param {Express.Req} req Express.js's request object.
     * @param {Express.Res} req Express.js's response object.
     * @param {Express.Next} req Express.js's next object.
     * return {boolean} Returns TRUE if the desired AccessLevel is met, FALSE
     *                  if not.
     */
    authReqAPI.minAccessLevel = function(requiredAccessLevel, req, res, next) {
        var auth = req.auth,
            authToken = req.auth.tokenPayload || false,
            tokenAccessLevel = authToken.accessLevel ||-1;
        
        if (requiredAccessLevel <= tokenAccessLevel) return true;
        
        res.json({
            error: {
                code: 'insufficient_access_level',
                message: "This operation requires an AccessLevel of " +
                    requiredAccessLevel + ". The supplied token has "  +
                    "AccessLevel " + tokenAccessLevel + "."
            }
        });

        return false;
    }
    
    return authReqAPI;
})();

module.exports = authFunctions;