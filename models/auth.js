var crypto = require('crypto');
var sqlite = require('sqlite3');
var jwt = require('jsonwebtoken');
var config = require('../config/config.json');
var tokenEncodeKey = config.jwtSigningKey;

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


    if (apiKey !== undefined) {
        try {
            authModel.validateApiKeySyntax(apiKey);
        } catch(err) {
            return callback(err);
        }
        authModel.validateApiKey(
            apiKey, apiKeySecret,
            function (err, result) {
                if (err) return callback(err);
                accessLevel = result.accessLevel;
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
            }
        );
    } else {

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
    }
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
 * @throws Error    Thrown if the api key or api key secret does not match any
 *                  of the database entries.
 */
authModel.validateApiKey = function(apiKey, apiKeySecret, callback) {
    var db = new sqlite.Database(config.database.file);

    db
        .on("open", function() {
            db.all(
                [
                    'SELECT key, secret',
                    'FROM api_key',
                    'WHERE key = ?'
                ].join(" "),
                [apiKey],
                function(err, rows) {
                    db.close();
                    
                    // If there was an SQL error, return here.
                    if (err !== null) return callback(err);
                    
                    // Empty result set (no matching key)
                    if (rows.length === 0) {
                        var noResultsError = new Error("There were zero rows" +
                            " matching the given API key.");
                        noResultsError.name = "api_key_invalid";
                        return callback(noResultsError);
                    }
                    
                    // Determine the access level.
                    var keyData = rows.shift(),
                        accessLevel = 1;
                    
                    if (apiKeySecret !== undefined) {
                        if (keyData.secret !== apiKeySecret) {
                            var keyMismatchError = new Error("There was a " + "mismatch between the API key secret.");
                            keyMismatchError.name = "api_key_secret_mismatch";
                            return callback(keyMismatchError);
                        }
                        accessLevel = 2;
                    }
        
                    return callback(undefined, { accessLevel: accessLevel });
                }
            )
        })
        .on("error", function(err) {
            return callback(err);
        });
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
authModel.validateApiKeySyntax = function(apiKey) {
    if (apiKey === undefined 
        || !apiKey)
        return;

    var escapedKey = decodeURI(apiKey),
        keyLength = escapedKey.length,
        keyError = new Error("Error with the supplied API key.");
    
    if (keyLength === KEY_LENGTH)
        if (/[a-zA-Z0-9]*/gi)
            return escapedKey;

    keyError.name = "api_key_malformed";
    throw keyError;
};

/**
 * Validates a JavaScript Web Token to check for any evidence of tampering or
 * data manipulation. This method has no return value however will throw one of
 * several errors if there is an issue with the supplied token.
 * @param {string} jwtToken   The JWT, in its portable string format.
 * @param {function} callback   A standard callback function with parameters
 *                              err, result. The error supplied may be one of:
 *                                - "non_string_token" if the token supplied
 *                                  could not be recognised as a string.
 *                                - "invalid_token" if the token did not pass
 *                                  validation.
 *                                - "auth_token_revoked" if the token has been
 *                                  revoked.
 */
authModel.validateToken = function(jwtToken, callback) {
    var tokenError = new Error(),
        tokenVerification;

    // Check syntax
    if (typeof(jwtToken) !== "string") {
        tokenError.message = "The token provided was of type "
            + typeof(jwtToken) + " (expected string).";
        tokenError.name = "non_string_token";
        tokenError.httpStatus = 422;
        return callback(tokenError);
    }

    // Check JWT integrity
    try {
        tokenVerification = jwt.verify(jwtToken, tokenEncodeKey);
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            var validationError = new Error("The JWT string is invalid.");
            validationError.name = "auth_token_invalid";
            validationError.httpStatus = 422;
            return callback(validationError);
        }
    }
    
    // Check token integrity (i.e., all mandatory attributes present.)
    var payload = authModel.decodeToken(jwtToken),
        currentDate = Date.now();
    
    // Check for token expiry    
    if (( ! payload.exp) || currentDate > payload.exp) {
        var expiredError = new Error("This token has expired.");
        expiredError.name = "auth_token_expired";
        expiredError.httpStatus = 403;
        return callback(expiredError);
    }

    var db = new sqlite.Database(config.database.file);
    
    // Check revocation
    db
        .on("open", function() {
            db.all(
                [
                    'SELECT * FROM token_revoked',
                    'WHERE token = ?'
                ].join(" "),
                [jwtToken],
                function(err, rows) {
                    db.close();
                    
                    // If there was an SQL error, throw it here.
                    if (err !== null) {
                        var sqlError = new Error("There was an SQL error.");
                        sqlError.name = "auth_db_sql_error";
                        sqlError.innerError = err;

                        return callback(sqlError);
                    }
                    
                    // Check for matches to revoked tokens
                    if (rows.length !== 0) {
                        var tokenRevokedError = new Error("This auth token " +
                            "has been previously revoked");
                        tokenRevokedError.name = "auth_token_revoked";
                        tokenRevokedError.httpStatus = 403;

                        return callback(tokenRevokedError);
                    }

                    return callback(undefined, true);
                }
            )
        })
        .on("error", function(err) {
            var dbError = new Error("There was an error connecting to " + 
                "the authentication database.");
            dbError.name = "auth_db_connection_error";
            dbError.innerError = err;
            callback(dbError);
            return;
        });

};

/**
 * Revokes an authentication token by adding it to the token revoction table in
 * the database. This will raise an error if the token has already been revoked
 * or the token's signature can not be verified (i.e. it was not issued by this
 * server).
 * @param {string} jwtToken The JWT in its portable string format.
 * @param {function}    A callback function that is called once the revocation
 *                      has been completed with the standard params err, result.
 * @throws Error    Thrown if there is an error in the token string, has been
 *                  tampered with or has already expired. See `validateToken`
 *                  method for error details (these are simply bubbled up).
 */
authModel.revokeToken = function(jwtToken, callback) {

    // Define a process for token revocation, to be run if token validates
    var revokeToken = function(err, result) {
        // Throws an error if the token was not valid.
        if (err !== undefined) return callback(err);

        // Continues if there were no issues so far.
        var db = new sqlite.Database(config.database.file);
    
        db
            .on("open", function() {
                db.run(
                    [
                        'INSERT INTO token_revoked',
                        '(token, date)',
                        'VALUES (?, ?)'
                    ].join(" "),
                    [jwtToken, Date.now()],
                    function(err) {
                        db.close();
                        
                        // If there was an SQL error, throw it here.
                        if (err !== null) {
                            var sqlError = new Error("There was an SQL error.");
                            sqlError.name = "auth_db_sql_error";
                            sqlError.innerError = err;
                            return callback(sqlError);
                        }
                        
                        // Check that we've had an affect
                        if (this.changes !== 1) {
                            var notRevokedError = new Error("The revocation " +
                                "could not be added to the database.");
                            notRevokedError.name = "auth_token_not_revoked";
                            return callback(notRevokedError);
                        }
                        
                        callback(undefined, true);
                    }
                )
            })
            .on("error", function(err) {
                var dbError = new Error("There was an error connecting to " + 
                    "the authentication database.");
                dbError.name = "auth_db_connection_error";
                dbError.innerError = err;
                return callback(dbError);
            });
    };

    // Use errors from authModel (uncaught here.);        
    authModel.validateToken(
        jwtToken,
        revokeToken
    );
}

/**
 * Takes a JWT token as a string and decodes its contents. This does NOT verify
 * the token for validity.
 * @param {string} jwtToken The JWT token (in its entirety) that should be
 *                          decoded.
 * @return {*}  Returns the JSON payload of the web token.
 */
authModel.decodeToken = function(jwtToken) {
    var payload = jwt.decode(jwtToken);
    return payload;
};

module.exports = authModel;