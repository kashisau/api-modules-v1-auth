'use strict';
/**
 * Authentication model - Authentication token creation testing
 *
 * This is a basic test suite that will create a series of authentication
 * tokens with varying levels of access, based on the supplied API key and
 * corresponding secret key. The supplied API key and corresponding secret key
 * must be valid in order for this test suite to work (typically established in
 * the auth-model test runner.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');

    it("Create an renewal token with AccessLevel 0 (anonymous)", function (done) {
        var jwtString;

        jwtString = authModel.createRenewToken(
            undefined,
            undefined,
            function (err, renewToken) {
                renewToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(renewToken);
                authTokenPayload.accessLevel.should.equal(0);
                done();
            }
        );
    });

    it("Create an auth token with AccessLevel 1 (API Key supplied)", function (done) {
        var jwtString;

        jwtString = authModel.createRenewToken(
            apiTestAccount.key,
            undefined,
            function (err, renewToken) {
                renewToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(renewToken);
                authTokenPayload.accessLevel.should.equal(1);
                done();
            }
        )
    });

    it("Create an auth token with AccessLevel 2 (API key & corresponding secret key supplied)", function (done) {
        var jwtString;

        jwtString = authModel.createRenewToken(
            apiTestAccount.key,
            apiTestAccount.secret,
            function (err, renewToken) {
                renewToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(renewToken);
                authTokenPayload.accessLevel.should.equal(2);
                done();
                doneCallback();
            }
        );
    });
};