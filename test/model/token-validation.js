'use strict';
/**
 * Authentication model - Authentication token validation testing
 *
 * This series of tests will check that JWT tokens issued by the Authentication
 * model are correctly verified. Each of the AccessLevels are individually
 * tested to assess their validity from issuance. There is a separate series of
 * tests to verify that invalid tokens are met with the appropriate errors.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');

    it("Validate a valid token with AccessLevel 0", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            undefined,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                (function () {
                    authModel.validateToken(authToken);
                }).should.not.throw();
                authTokenPayload.accessLevel.should.equal(0);
                done();
            }
        );
    });

    it("Validate a valid token with AccessLevel 1", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                (function () {
                    authModel.validateToken(authToken);
                }).should.not.throw();
                authTokenPayload.accessLevel.should.equal(1);
                done();
            }
        )
    });

    it("Validate a valid token with AccessLevel 2", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            apiTestAccount.secret,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                (function () {
                    authModel.validateToken(authToken);
                }).should.not.throw();
                authTokenPayload.accessLevel.should.equal(2);
                done();
                doneCallback();
            }
        );
    });
};
