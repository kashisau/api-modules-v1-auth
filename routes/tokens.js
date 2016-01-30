/**
 * Authentication module token method routing
 * 
 * An Express router that handles requests to the authentication module of the
 * API. The `token` methods of the Authentication module are directed to their
 * respective route handlers here.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */

var express = require('express');
var path = require('path');
var router = express.Router();

router
    /**
     * The POST method will generate a new auth token AND renew token supplied
     * to the client using sinple JSON.
     */
    .post('', require(path.join(__dirname, 'tokens/post-create.js')))
    /**
     * The GET method will validate an auth token for the requesting client,
     * supplying general information about the specified token.
     */
    .get('/:token', require(path.join(__dirname, 'tokens/get-verify.js')))
    /**
     * Accepts a renewal token with which to issue a corresponding auth token.
     * The renewal token offered is used to determine the payload of the auth
     * token (after being validated, of course.)
     */
    .put('', require(path.join(__dirname, 'tokens/put-renew.js')))
    /**
     * Token revocation for the renwal token, invalidating that particular
     * token. Authentication tokens are not revoked (i.e. they are valid until
     * their point of expiry.)
     */
    .delete('/:token',
        require(path.join(__dirname, 'tokens/delete-renew-token.js'))
    );

module.exports = router;