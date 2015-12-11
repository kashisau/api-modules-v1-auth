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

    var rnd = function(s, len) {
        // Bit of code golf, (because it always helps to harden one's
        // knowledge of functional behaviour. Also, I'm technically on a
        // holiday, so golf seems appropriate.)
        // Target length: try arg0 for valid int, then arg1, or default 25
        len = +s || +len || 25;
        // String so far: take the given string in arg0, or create one
        s = isNaN(+s)? s || "" : "";
        // Is the string the desired length yet?
        return (s.length < len)?
            // No - enter new stack frame with a random character appended
            rnd(
                s + String.fromCharCode(
                    // Find our ASCII "a", and add a random offset 0-25
                    // where we have a random number [0,26) bitwise floored
                    "a".charCodeAt(0) + ~~(Math.random() * 26)),
                // Pass on the target length information
                len
            )
            // Yes - return the resultant string and fly up the stack
            : s
        },
        authModel = require('../models/auth.js'),
        testAccount = {
            key: rnd(),
            secret: rnd()
        },
        dbConfig = require('../config/config.json').database;

    before(function (done) {
        require('./model/before-sqlite-test.js')(testAccount, dbConfig, done);
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

    describe("Error reporting with invalid JWT tokens", function (done) {
        require('./model/token-validation-errors.js')(authModel, testAccount, done);
    });

    describe("Token revocation integrity", function (done) {
        require('./model/token-revocation.js')(authModel, testAccount, done);
    });

    after(function (done) {
        require('./model/after-sqlite-test.js')(testAccount, dbConfig, done);
    });
});