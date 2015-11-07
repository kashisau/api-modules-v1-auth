'use strict';
/**
 * Authentication model - MySql after testing
 *
 * Removes any temporary API testing accounts established during the Before
 * MySQL testing phase. The API test account credentials supplied must match
 * those given to the Before MySQL testing suite as this test verifies that one
 * (and only one) row is removed from the API user database.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(apiTestAccount, dbCredentials, doneCallback) {
    var mysql = require('mysql'),
        conn = mysql.createConnection(dbCredentials),
        should = require('should');

    it("Remove temporary API user (testing complete)", function(done) {
        conn.query(
            [
                'DELETE FROM api_key',
                'WHERE api_key.key = ?' +
                'AND api_key.secret = ?',
                'LIMIT 1'
            ].join(" "),
            [apiTestAccount.key, apiTestAccount.secret],
            function(err, result) {
                should.not.exist(err);
                result.affectedRows.should.equal(1);
                done();
                doneCallback();
            }
        )
    });
};