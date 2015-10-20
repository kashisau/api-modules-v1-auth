var crypto = require('crypto');
var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var credentials = require('../auth/modules/auth/config.json');
var tokenEncodeKey = credentials.jwtSigningKey;

var DEFAULT_EXPIRY = 7200;
var KEY_LENGTH = 25;
var TOKEN_AUDIENCE = 'https://localhost:3000/';

var authModel = {};
/**
 * Creates a new JavaScript Web token (JWT) and stores its initialisation data
 * in the token table within the database. This method takes optional API key
 * and corresponding secret information in order to generate a JWT with higher
 * accessLevels. Absent of these
 * @param {string} apiKey   (Optional) API key to which the authentication
 *                          token should be associated. Supplying this without
 *                          the apiSecretKey will result in a token with
 *                          accessLevel 1.
 * @param {string} apiKeySecret (Optional) API key corresponding secret. If
 *                              supplied with the apiKey an authentication
 *                              token of accessLevel 2 will be issued.
 * @param {Date} expiry (Optional) server time at which the authentication
 *                      token will be invalidated.
 * @param {function} callback   A callback function that accepts the standard
 *                              params err, result.
 */
authModel.createToken = function(apiKey, apiKeySecret, expiry, callback) {
    var accessLevel = 0,
        expiry = expiry || DEFAULT_EXPIRY,
        currentTime = Date.now(),
        expiryTime = Date.now() + expiry * 1000;


    if (apiKey !== undefined)
        authModel.validateApiKey(
            apiKey, apiKeySecret,
            function(err, result) {
                if (err) return callback(err);
                accessLevel = result.accessLevel;
            }
        );
    
    var jwtString = jwt.sign(
        {
            accessLevel: accessLevel,
            aud: TOKEN_AUDIENCE,
            iat: currentTime,
            exp: expiryTime,
            apiKey: apiKey
        },
        tokenEncodeKey
    );
    
    callback(undefined, jwtString);
};

/**
 * Checks that the supplied key, secret key pair in order to assess validity.
 * @param {string} apiKey   (Optional) API key to which the authentication
 *                          token should be associated. Supplying this without
 *                          the apiSecretKey will result in a token with
 *                          accessLevel 1.
 * @param {string} apiKeySecret (Optional) API key corresponding secret. If
 *                              supplied with the apiKey an authentication
 *                              token of accessLevel 2 will be issued.
 * @param {function} callback   A callback function that accepts the standard
 *                              params err, result.
 */
authModel.validateApiKey = function(apiKey, apiKeySecret, callback) {
    var conn = mysql.createConnection(credentials.database);

    conn.connect();
    conn.query(
        [
            'SELECT api_key.key',
            'FROM api_key',
            'WHERE api_key.key = ?',
            'AND status = "ACTIVE"'
        ].join(" "),
        [apiKey, apiKeySecret],
        function(err, rows, fields) {
            if (err) return callback(err);
            if (rows.length === 0) {
                var noResultsError = new Error("There were zero rows" +
                    " matching the given API key and secret.");
                noResultsError.code = "api_key_invalid";
                return callback(noResultsError);
            }
            // Determine the access level.
            var keyData = rows.shift(),
                accessLevel = 1;
            
            if (apiKeySecret !== undefined
                && keyData.secret === apiKeySecret)
                accessLevel = 2;

            return callback(undefined, { accessLevel: accessLevel });
        }
    );
};

/**
 * Checks the syntax of the apiKey for correctness, if one is supplied. This
 * method will unescape any characters before returning the resulting string.
 * If no value is supplied, a value of undefined is supplied.
 * @param {string} apiKey   (Optional) an API key to check for syntactical
 *                          correctness. If no value is supplied then a value
 *                          of undefined is returned.
 * @return {string} A string of the supplied apiKey is returned, having been
 *                  unescaped and validated.
 * @throws {Error}  Throws an error with name "api_key_malformed" if the API
 *                  key supplied is not syntactically correct.
 */
authModel.validateApiKey = function(apiKey) {
    if (apiKey === undefined 
        || !apiKey)
        return;

    var escapedKey = decodeURI(apiKey),
        keyLength = escapedKey.length,
        keyError = new Error("Error with the supplied API key.");
    
    if (keyLength === KEY_LENGTH)
        if (/[a-zA-Z0-9]*/gi)
            return escapedKey;

    keyError.name = "key_malformed";
    throw keyError;
};

/**
 * Validates a JavaScript Web Token to check for any evidence of tampering or
 * data manipulation. This method has no return value however will throw one of
 * several errors if there is an issue with the supplied token.
 * @param string jwtToken   The JWT, in its portable string format.
 */
authModel.validateToken = function(jwtToken) {
    var tokenError = new Error(),
        tokenVerification;

    if (typeof(jwtToken) !== "string") {
        tokenError.message = "The token provided was of type "
            + typeof(jwtToken) + " (expected string).";
        tokenError.name = "non_string_token";
        throw tokenError;
    }
    
    tokenVerification = jwt.verify(jwtToken, tokenEncodeKey);

};
module.exports = authModel;