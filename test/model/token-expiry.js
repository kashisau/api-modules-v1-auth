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
    
    it("Raise a auth_token_expired error when attempting to use an expired token", function(done) {
        should(
            authModel.createToken(
                undefined,
                undefined,
                -1,
                function(err, authToken) {
                    should.not.exist(err);
                    authToken.should.be.a.string;
                    authModel.validateToken(
                        authToken,
                        function(err, result) {
                            should(err).be.an.object;
                            err.name.should.equal('auth_token_expired');
                            done();
                        }
                    );
                }
            )
        ).not.throw();
    });
};