'use strict';
/**
 * Authentication model - Token creation
 *
 * This test suite checks that the central database is accessible and creates a
 * series of authentication tokens with the available AccessLevels (using
 * credentials stored in the config.json file for this API module).
 *
 * The first test establishes database connectivity, followed by the actual
 * token creation as well as edge cases, and finally, the testing data is
 * removed from the database.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
describe('Authentication model', function() {

    var rnd = function(s) {
            s = s || "";
            return (s.length < 25)?
                rnd(
                    s
                    + String.fromCharCode(
                        "a".charCodeAt(0) + ~~(Math.random() * 26))
                )
                : s
        },
        authModel = require('../models/auth.js'),
        testAccount = {
            key: rnd(),
            secret: rnd()
        },
        dbCredentials = require('../config/config.json').database;

    before(function (done) {
        this.timeout(5000);
        require('./model/before-mysql-test.js')(testAccount, dbCredentials, done);
    });

    describe("Token creation with various AccessLevels", function (done) {
        require('./model/token-creation.js')(authModel, testAccount, done);
    });

    describe("Error reporting with invalid credentials", function (done) {
        require('./model/invalid-credentials.js')(authModel, testAccount, done);
    });

    describe("Token validation with various AccessLevels", function (done) {
        require('./model/token-validation.js')(authModel, testAccount, done);
    });

    after(function (done) {
        require('./model/after-mysql-test.js')(testAccount, dbCredentials, done);
    });
});