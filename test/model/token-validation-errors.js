'use strict';
/**
 * Authentication model - Authentication token validation testing
 *
 * Verifies that token validation reports errors where the JWT token string has
 * been modified. This suite handles simple character modifications.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(authModel, apiTestAccount, doneCallback) {
    var should = require('should'),
        // Code-golf documented in ./../auth-model.js
        rnd=function(a,b){return b=+a||+b||25,a=isNaN(+a)?a||"":"",a.length<b?
            rnd(a+String.fromCharCode("a".charCodeAt(0)+~~(26*Math.random())),
                b):a},
        // More code golf, this method replaces a single character in a string.
        rplAChar = function(string) {
            // Convert our string into an Array
            var sA = string.split(""),
            // Define some random index within the array's domain
                i = ~~(Math.random()*sA.length),
            // Prepare some random character (using our rnd function).
                c = rnd(1);
            // Keep guessing characters until we have a mismatch
            while (sA[i] === c) c = rnd(1);
            // Rewrite the character in question
            sA[i] = c;
            // Return a new string
            return sA.join("");
        };

    it("Raise an auth_token_invalid error for an invalid token with AccessLevel 0", function (done) {
        var jwtString;

        jwtString = authModel.createToken(
            undefined,
            undefined,
            undefined,
            function (err, authToken) {
                authToken.should.be.a.string;
                var authTokenPayload = authModel.decodeToken(authToken),
                    authToken = authToken.split('.'),
                    aCharIndex = ~~(Math.random()*authToken[1].length);

                authTokenPayload.accessLevel.should.equal(0);
                authToken[1] = rplAChar(authToken[1]);
                authToken = authToken.join('.');

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
                var authTokenPayload = authModel.decodeToken(authToken),
                    authToken = authToken.split('.'),
                    aCharIndex = ~~(Math.random()*authToken[1].length);

                authTokenPayload.accessLevel.should.equal(1);
                authToken[1] = rplAChar(authToken[1]);
                authToken = authToken.join('.');

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
                var authTokenPayload = authModel.decodeToken(authToken),
                    authToken = authToken.split('.'),
                    aCharIndex = ~~(Math.random()*authToken[1].length);

                authTokenPayload.accessLevel.should.equal(2);
                authToken[1] = rplAChar(authToken[1]);
                authToken = authToken.join('.');

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
