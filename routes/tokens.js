var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var authModel = require('../models/auth.js');

/**
 * Authentication module routing
 * 
 * An Express router that handles requests to the authentication module of the
 * API. This object uses the authentication model to process requests and acts
 * largely as a controller.
 * 
 * This implementation uses cookies to set and retrieve authentication tokens,
 * meaning that clients are unable to provide arbitrary tokens for requests.
 */
router
    /**
     * The POST method will generate a new auth token AND renew token supplied
     * to the client using sinple JSON.
     */
    .post('(.json)?', require('tokens/post.js'))
    /**
     * The GET method will validate an auth token for the requesting client,
     * supplying general information about the specified token.
     */
    .get('(.json)?/:auth-token', require('tokens/get-token.js'))
    /**
     * Accepts a renewal token with which to issue a corresponding auth token.
     * The renewal token offered is used to determine the payload of the auth
     * token (after being validated, of course.)
     */
    .put('(.json)?/:renew-token', require('tokens/put-token.js'))
    /**
     * Token revocation for the renwal token, invalidating that particular
     * token. Authentication tokens are not revoked (i.e. they are valid until
     * their point of expiry.)
     */
    .delete('(.json)/:renew-token', require('tokens/delete-renew-token.js'));

module.exports = router;