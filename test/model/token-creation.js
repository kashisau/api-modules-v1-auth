'use strict';
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');

    it("Create a JWT token with AccessLevel 0 (anonymous)", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            undefined,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(0);
                done();
            }
        );
    });

    it("Create a JWT token with AccessLevel 1 (API Key supplied)", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(1);
                done();
            }
        )
    });

    it("Create a JWT Token with AccessLevel 2 (API key & corresponding secret key supplied)", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            apiTestAccount.key,
            apiTestAccount.secret,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken);
                authTokenPayload.accessLevel.should.equal(2);
                done();
                doneCallback();
            }
        );
    });
};