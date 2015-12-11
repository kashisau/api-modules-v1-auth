'use strict';
/**
 * Authentication model - SQLite after testing
 *
 * Removes any temporary API testing accounts established during the Before
 * SQLite testing phase. The API test account credentials supplied must match
 * those given to the Before SQLite testing suite as this test verifies that one
 * (and only one) row is removed from the API user database.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(apiTestAccount, dbConfig, doneCallback) {
    var sqlite = require('sqlite3'),
        db = new sqlite.Database(dbConfig.file),
        should = require('should');

    db.on("open", function() {
        db.run(
            [
                'DELETE FROM api_key',
                'WHERE key = ?' +
                'AND secret = ?'
            ].join(" "),
            [apiTestAccount.key, apiTestAccount.secret],
            function(err) {
                should(err).be.null;
                this.changes.should.equal(1);
                doneCallback();
            }
        )
    });
};