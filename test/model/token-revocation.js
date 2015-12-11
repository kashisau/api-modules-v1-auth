'use strict';
/**
 * Authentication model - Authentication token revocation testing
 *
 * This test suite is designed to ensure that token revocation works as expected
 * for the authentication module.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');
    
    it("Raise a auth_token_revoked error when attempting to use a revoked token", function(done) {
        should(
            authModel.createToken(
                undefined,
                undefined,
                -1,
                function(err, authToken) {
                    should.not.exist(err);
                    authModel.revokeToken(authToken, function(err, result) {
                        should(err).be.undefined;
                        result.should.be.true;
                        try {
                            authModel.validateToken(authToken);
                        } catch(err) {
                            err.name.should.equal('auth_token_not_revoked');
                            done();
                        }
                    });
                }
            )
        ).not.throw();
    });
};