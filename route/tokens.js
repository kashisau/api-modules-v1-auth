var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var authModel = require('../../../../models/auth.js');

/**
 * Authentication module routing
 * 
 * An Express router that handles requests to the authentication module of the
 * API. This object uses the authentication model to process requests and acts
 * largely as a controller.
 */
router
    .post('(.xml|.json)?', function(req, res, next) {
        var apiTarget = req.apiTarget,
            newJwt;

        authModel.createToken(
            undefined, undefined,  undefined,
            function(err, tokenString) {
                if (err) return next(err);
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
                res.send({data: { token : tokenString }});
            }
        );
    })
    .get('(.xml|.json)?/:token?', function(req, res, next) {
        if (req.params.token !== undefined) {
            res.send("Information specifically relating to your token: " + req.params.token);
        } else {
            //res.send("List of tokens.");
            authModel.validateApiKey(
                req.headers.apiKey,
                req.headers.secretKey,
                function(err, matchingKey) {
                    if (err) return next(err);
                    res.json(matchingKey);
                }
            );
        }
    })
    .delete('(.xml|.json)?/:token', function(req, res, next) {
        res.send("Invalidating YOUR TOKEN");
    });

/**
 * Establishes a connection to the database, returning the connection object
 * ready for query running.
 * @param {string} authFile The file with authentication credentials for the
 *                          MySQL database being used.
 * @returns {*} Returns a MySQL connection object that may be used to run
 *              queries against.
 */
function connect_mysql(authFile) {
    var authFileContents,
        connection;

    //mysql.createConnection();

    return {};
}

function createJwt(req) {
    var jwtKey = randomBase64(256),
        payload = {
            accessLevel: 0,
            apiVersion: 1.0
        },
        options = {
            issuer: req.hostname
        },
        jwtString;

    jwtString = jwt.sign(payload, jwtKey, options);
    
    return {
        jwt: jwtString,
        jwtKey: jwtKey 
    };
}

/**
 * Uses the Node.js Cryto module to create a cryptographically-secure random
 * string of 
 * @param length
 * @returns {string}
 */
function randomBase64(length) {
    var randomBytes = crypto.randomBytes(length);
    
    return randomBytes.toString('base64');
};

module.exports = router;