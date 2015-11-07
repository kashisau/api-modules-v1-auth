'use strict';

describe('Authentication model', function() {

    var authModel = require('../models/auth.js'),
        testingAccounts = require('../config/config.json').testAccounts;

    describe("Authentication server connectivity", function() {
        it("Have access to the authentication server", function(done) {
            var mysql = require('mysql'),
                mysqlCredentials = require('../config/config.json').database,
                conn = mysql.createConnection(mysqlCredentials),
                should = require('should');

            conn.connect(function(err) {
                should.not.exist(err);
                conn.end();
                done();
            });
        });
    });

    describe("Token creation with various AccessLevels", function() {
        it("Create a JWT token with AccessLevel 0 (anonymous)", function (done) {
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

        it("Create a JWT token with AccessLevel 1", function (done) {
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

        it("Create a JWT Token with AccessLevel 2", function (done) {
            var jwtString;

            jwtString = authModel.createToken(
                testingAccounts.accessLevel2.apiKey,
                testingAccounts.accessLevel2.apiKeySecret,
                undefined,
                function(err, authToken) {
                    authToken.should.be.a.string;
                    var authTokenPayload = authModel.decodeToken(authToken);
                    authTokenPayload.accessLevel.should.equal(2);
                    done();
                }
            );
        });
    });
});