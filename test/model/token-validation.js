'use strict';
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
            }
        );
    });

    it("Raise an auth_token_invalid error for an invalid token with AccessLevel 0", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            undefined,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(0);
                authToken += "jibberish";
                (function () {
                    authModel.validateToken(authToken);
                }).should.throw(
                    Error, {code: 'auth_token_invalid'}
                );
                done();
            }
        );
    });

    it("Raise an auth_token_invalid error for an invalid token with AccessLevel 1", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(1);
                authToken += "jibberish";
                (function () {
                    authModel.validateToken(authToken);
                }).should.throw(
                    Error, {code: 'auth_token_invalid'}
                );
                done();
            }
        )
    });

    it("Raise an auth_token_invalid error for an invalid token with AccessLevel 2", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            apiTestAccount.secret,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(2);
                authToken += "jibberish";
                (function () {
                    authModel.validateToken(authToken);
                }).should.throw(
                    Error, {code: 'auth_token_invalid'}
                );
                done();
                doneCallback();
            }
        )
    });
};
