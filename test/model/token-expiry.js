'use strict';
/**
 * Authentication model - Authentication token expiry testing
 *
 * This test suite is designed to ensure that token expiry is identified and 
 * flagged correctly by the authentication module.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');
    var path = require('path');
    var jwt = require('jsonwebtoken');
    var crypto = require('crypto');
    var signingKey = process.env.AUTHV1_JWT_KEY;
    
    var TOKEN_AUDIENCE =  process.env.API_SRV_ADDR || 'https://localhost:3000';
    
    it("Raise an auth_token_expired error when trying to validate an expired auth token", function(done) {
        var currentTime = Date.now(),
            expiryTime = currentTime - 1,
            jwtID = crypto.randomBytes(20).toString('hex'),
            tokenString;
            
        tokenString = jwt.sign(
            {
                accessLevel: 0,
                type: 'auth',
                jti: jwtID,
                aud: TOKEN_AUDIENCE,
                nbf: currentTime,
                iat: currentTime,
                exp: expiryTime
            },
            signingKey
        );
        
        should(authModel.validateToken(tokenString, confirmExpiryError))
            .not.throw();
        
        function confirmExpiryError(err, result) {
            should(result).be.undefined;
            err.httpStatus.should.equal(401);
            err.name.should.equal('auth_token_expired');
            done();
        }
    });
};