'use strict';
/**
 * Authentication model - Authentication token renewal testing
 *
 * This test suite establishes a renewal token and corresponding intial auth
 * token, applying to the Authentication model's token renewal methods to esure
 * an equivilent renewed auth token is issued in response.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');

    it("Create a new renew & auth token pair and apply for renewal", function (done) {
        var jwtString;

        jwtString = authModel.createRenewToken(
            undefined,
            undefined,
            function (err, renewToken) {
                renewToken.should.be.a.string;
                var renewPayload = authModel.decodeToken(renewToken);
                renewPayload.type.should.equal("renew");
                renewPayload.accessLevel.should.equal(0);
                renewPayload.jti.should.be.a.string;
                
                setTimeout(renewAuthToken, 1000);
                
                function renewAuthToken() {
                    authModel.renewAuthToken(renewToken, checkAuthToken);
                }
                
                function checkAuthToken(err, authToken) {
                    should(err).be.null;
                    var authPayload = authModel.decodeToken(authToken);
                    authPayload.type.should.equal("auth");
                    authPayload.exp.should.be.lessThan(
                        Date.now() + 60 * 16 * 1000
                    );
                    authPayload.renewJti.should.equal(renewPayload.jti);
                    done();
                }
            }
        );
    });

};