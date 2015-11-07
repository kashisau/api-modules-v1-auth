'use strict';
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