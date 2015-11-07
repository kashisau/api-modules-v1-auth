'use strict';
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should');

    it("Raise an api_key_malformed error when an API key is syntactically incorrect", function (done) {
        var jwtString;
        jwtString = authModel.createToken(
            (function rnd(s) {
                s = s || "";
                return (s.length < 10) ? rnd(s + String.fromCharCode("a".charCodeAt(0) + ~~(Math.random() * 26))) : s
            })(),
            undefined,
            undefined,
            function (err, authToken) {
                should.exist(err);
                should.exist(err.code);
                err.code.should.equal("api_key_malformed");
                should.not.exist(authToken);
                done();
            }
        );
    });

    it("Raise an api_invald_key error when an API key is incorrect", function (done) {
        var jwtString;
        jwtString = authModel.createToken(
            (function rnd(s) {
                s = s || "";
                return (s.length < 25) ? rnd(s + String.fromCharCode("a".charCodeAt(0) + ~~(Math.random() * 26))) : s
            })(),
            undefined,
            undefined,
            function (err, authToken) {
                should.exist(err);
                should.exist(err.code);
                err.code.should.equal("api_key_invalid");
                should.not.exist(authToken);
                done();
            }
        );
    });

    it("Raise an api_key_secret_mismatch error when a valid API key is supplied with an invalid secret key", function (done) {
        var jwtString;
        jwtString = authModel.createToken(
            apiTestAccount.key,
            (function rnd(s) {
                s = s || "";
                return (s.length < 25) ? rnd(s + String.fromCharCode("a".charCodeAt(0) + ~~(Math.random() * 26))) : s
            })(),
            undefined,
            function (err, authToken) {
                should.exist(err);
                should.exist(err.code);
                err.code.should.equal("api_key_secret_mismatch");
                should.not.exist(authToken);
                done();
                doneCallback();
            }
        );
    });
};