'use strict';

describe('Authentication model', function() {

    var authModel,
        SECRET_KEY,
        testingAccounts;

    before(function() {
        authModel = require('../models/auth.js');
        testingAccounts = require('../config/config.json').testAccounts;
    });

    describe("Token creation", function() {
        it("Should create a JWT token with AccessLevel 0", function (done) {
            var jwtString;

            jwtString = authModel.createToken(
                undefined,
                undefined,
                undefined,
                function (err, authToken) {
                    authToken.should.be.a.string;
                    done();
                }
            );
        });

        it("Should create a JWT token with AccessLevel 1", function (done) {
            var jwtString;

            jwtString = authModel.createToken(
                testingAccounts.accessLevel1.apiKey,
                undefined,
                undefined,
                function(err, authToken) {
                    authToken.should.be.a.string;
                    var authTokenPayload = authModel.decodeToken(authToken);
                    authTokenPayload.accessLevel.should.equal(1);
                    done();
                }
            )
        });

    });
});