'use strict';
/**
 * Authentication model - MySQL testing
 *
 * This series of tasks will check basic connectivity to the MySQL server that
 * the Authentication module uses (as defined in the /config/config.json file).
 * Once the database connection has been verified, a new test account is made
 * using the API key and API key secret established in the auth-model testing
 * suite.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(apiTestAccount, dbCredentials, doneCallback) {
    var mysql = require('mysql'),
        conn = mysql.createConnection(dbCredentials),
        should = require('should');

    conn.connect(function(err) {
        should.not.exist(err);
    });

    conn.query(
        [
            'INSERT INTO api_key',
            '(api_key.key, api_key.secret)',
            'VALUES (?, ?)'
        ].join(" "),
        [apiTestAccount.key, apiTestAccount.secret],
        function(err, result) {
            should.not.exist(err);
            result.insertId.should.be.a.number;
            doneCallback();
        }
    );
};