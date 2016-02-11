var crypto = require("crypto");
var sqlite = require("sqlite3");
var jwt = require("jsonwebtoken");
var path = require("path");

var dotenv = require("dotenv");

dotenv.config({path: "./.env.example", silent: true});
dotenv.config({silent: true});

var tokenEncodeKey = process.env.AUTHV1_JWT_KEY;
var dbFilepath = path.join(__dirname, "../", process.env.AUTHV1_DB_FILE);

var DEFAULT_RENEW_EXPIRY = 3600 * 24 * 365 * 2; // 1 Year expiry
var DEFAULT_AUTH_EXPIRY = 60 * 15; // 15 minute expiry

var KEY_LENGTH = 25;
var TOKEN_AUDIENCE =  process.env.API_SRV_ADDR || 
    'https://localhost:3000';

var authModel = {};
/**
 * Creates a renewal token using the supplied parameters. Renewal tokens may be
 * used to create authentication tokens (i.e., auth tokens cannot be created
 * directly).
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
authModel.createRenewToken = function(apiKey, apiKeySecret, callback) {
    var accessLevel = 0;

    if (apiKey !== undefined) {
        try {
            authModel.validateApiKeySyntax(apiKey);
        } catch(err) {
            return callback(err);
        }

        return authModel.validateApiKey(
            apiKey,
            apiKeySecret,
            validateApiKeyCallback
        );

    }
    
    // No API key defined create a token with AccessLevel 0.
    _createToken(
        undefined,
        0,
        DEFAULT_RENEW_EXPIRY,
        'renew',
        issueToken
    );
    
    // Handles the control flow if an API key was supplied.
    function validateApiKeyCallback (err, result) {
        if (err) return callback(err);
        
        accessLevel = result.accessLevel;
        // API key validated, create a token with AccessLevel 1.

        _createToken(
            apiKey,
            accessLevel,
            DEFAULT_RENEW_EXPIRY,
            'renew',
            issueToken
        );
    }
    
    // Calls the original callback once a token has been generated.
    function issueToken(err, jwtString) {
        if (err) return callback(err);
        return callback(null, jwtString);
    }
};

/**
 * Creates a new JWT string that acts as an authentication token or renewal
 * token, depending on its type. Authentication tokens have a short-lived life-
 * span and not checked for revocation in a typical workflow, whereas renewal
 * tokens are less commonly used and thus compared against a revocation list.
 * This is not a public method as it is quite powerful (i.e., any type of token
 * may be created) however there's a lot of commonality between auth and renew
 * token generation thus the single method exists.
 * @param {string} apiKey   (Optional) API key against which the token will be
 *                          created (for tracability).
 * @param {number} accessLevel  The access level of the token being
 *                              created.
 * @param {number} expiry   The duration (in seconds from now) for which the
 *                          token should be valid.
 * @param {string} type The type of token being generated (i.e., 'auth' for an
 *                      authentication token, 'renew' for a renewal token.)
 * @param {function(err, token)} callback   A callback function to apply once
 *                                          an error has occurred or the token
 *                                          is ready.
 * @private
 */
function _createToken(apiKey, accessLevel, expiry, type, callback) {
    if (isNaN(accessLevel))
        return callback(new Error("Invalid accessLevel (NaN)"));
    if (isNaN(expiry) || !expiry)
        return callback(new Error("Invalid expiry (NaN)."));
    if (['auth', 'renew'].indexOf(type) === -1)
        return callback(new Error("Invalid type. Supplied '" + type
            + "'"));

    var jwtID = crypto.randomBytes(20).toString('hex'),
        currentTime = Date.now(),
        expiryTime = Date.now() + expiry * 1000,
        tokenString;

    tokenString = jwt.sign(
        {
            accessLevel: accessLevel,
            type: type,
            jti: jwtID,
            aud: TOKEN_AUDIENCE,
            nbf: currentTime,
            iat: currentTime,
            exp: expiryTime,
            apiKey: apiKey
        },
        tokenEncodeKey
    );
    
    callback(null, tokenString);
}

/**
 * Creates an authentication token from an existing renew token, copying the
 * relevant properties across. This method will validate the renewal token
 * before use.
 * @param {string} renewJwt The JWT-string containing the renewal token.
 * @oaram {function} callback   A callback function to execute once the renewal
 *                              token is ready.
 */
authModel.renewAuthToken = function(renewJwt, callback) {
    authModel.validateToken(renewJwt, transferRenewToken);
    
    function transferRenewToken(err, result) {
        if (err) return callback(err);
        
        var renewPayload = authModel.decodeToken(renewJwt),
            apiKey = renewPayload.apiKey,
            type = renewPayload.type;
        
        // Check that the user is using an actual renewal token.
        if (type !== "renew") {
            var wrongTokenError = new Error("The token used for renewal must "
                + "be the correct type (renewal token expected, "
                + type + "found.)");

            wrongTokenError.name = "auth_renewal_wrong_token_type";
            wrongTokenError.httpStatus = 400;
            
            return callback(wrongTokenError);
        }
        
        // Check that the API key is still valid
        if (!!renewPayload.apiKey)
            return authModel.validateApiKey(apiKey, undefined, apiKeyValidationCallback);
        
        apiKeyValidationCallback(null, false);

        // Check to see that the API key is still valid, issue a token if so.
        function apiKeyValidationCallback(err, result) {
            if (err) return callback(err); // Invalid/revoked API key.

            var currentTime = Date.now(),
                expiryTime = Date.now() + DEFAULT_AUTH_EXPIRY * 1000;

            // Re-use the renew payload properties, changing a few attributes:
            var newAuthToken = jwt.sign(
                {
                    accessLevel: renewPayload.accessLevel,
                    type: 'auth',
                    renewJti: renewPayload.jti,
                    aud: renewPayload.aud,
                    nbf: currentTime,
                    iat: currentTime,
                    exp: expiryTime,
                    apiKey: apiKey
                },
                tokenEncodeKey
            );

            return callback(null, newAuthToken);
        }
        
    }
}

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
    var db = new sqlite.Database(dbFilepath);

    db
        .on("open", function() {
            db.all(
                [
                    'SELECT key, secret',
                    'FROM api_key',
                    'WHERE key = ?'
                ].join(" "),
                [apiKey],
                processKeyLookupCallback
            )
        })
        .on("error", function(err) {
            return callback(err);
        });

    function processKeyLookupCallback (err, rows) {
        db.close();
        
        // If there was an SQL error, return here.
        if (err !== null) return callback(err);
        
        // Empty result set (no matching key)
        if (rows.length === 0) {
            var noResultsError = new Error("There were zero rows" +
                " matching the given API key.");

            noResultsError.httpStatus = 401;
            noResultsError.name = "api_key_invalid";
            return callback(noResultsError);
        }
        
        // Determine the access level.
        var keyData = rows.shift(),
            accessLevel = 1;
        
        if (apiKeySecret !== undefined) {
            if (keyData.secret !== apiKeySecret) {
                var keyMismatchError = new Error("There was a mismatch " + 
                    "the API key secret.");

                keyMismatchError.httpStatus = 401;
                keyMismatchError.name = "api_key_secret_mismatch";
                return callback(keyMismatchError);
            }
            accessLevel = 2;
        }

        return callback(undefined, { accessLevel: accessLevel });
    }
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
            
    keyError.httpStatus = 400;
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
    if (typeof(jwtToken) === "undefined") {
        tokenError.message = "The token provided was of type "
            + typeof(jwtToken) + " (expected string).";
        tokenError.name = "auth_token_missing";
        tokenError.httpStatus = 400;
        return callback(tokenError);
    }

    // Check JWT integrity
    try {
        tokenVerification = jwt.verify(jwtToken, tokenEncodeKey);
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            var validationError = new Error("The JWT string is invalid.");
            validationError.name = "auth_token_invalid";
            validationError.httpStatus = 401;
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
        expiredError.httpStatus = 401;
        return callback(expiredError);
    }

    // Auth tokens aren't checked for revocation (only renew tokens).
    if (payload.type === "auth")
        return callback(null, true);

    var db = new sqlite.Database(dbFilepath);
    
    // Check revocation
    db
        .on("open", function() {
            db.all(
                [
                    'SELECT * FROM token_revoked',
                    'WHERE token = ?'
                ].join(" "),
                [jwtToken],
                revokedTokenSelectCallback
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
        
        function revokedTokenSelectCallback (err, rows) {
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
                var tokenRevokedError = new Error("This token " +
                    "has been previously revoked");
                tokenRevokedError.name = "renew_token_revoked";
                tokenRevokedError.httpStatus = 401;

                return callback(tokenRevokedError);
            }

            return callback(undefined, true);
        }

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
        var db = new sqlite.Database(dbFilepath),
            payload = authModel.decodeToken(jwtToken);
        
        db
            .on("open", function() {
                db.run(
                    [
                        'INSERT INTO token_revoked',
                        '(token, date, jti)',
                        'VALUES (?, ?, ?)'
                    ].join(" "),
                    [jwtToken, Date.now(), payload.jti],
                    tokenRevokationInsertCallback
                )
            })
            .on("error", function(err) {
                var dbError = new Error("There was an error connecting to " + 
                    "the authentication database.");
                dbError.name = "auth_db_connection_error";
                dbError.innerError = err;
                return callback(dbError);
            });

        function tokenRevokationInsertCallback (err) {
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