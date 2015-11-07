'use strict';
module.exports = function(apiTestAccount, dbCredentials, doneCallback) {
    var mysql = require('mysql'),
        conn = mysql.createConnection(dbCredentials),
        should = require('should');

    it("Have access to the authentication server", function(done) {
        conn.connect(function(err) {
            should.not.exist(err);
            done();
        });
    });

    it("Insert temporary API user for testing purposes", function(done) {
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
                done();
                doneCallback();
            }
        )
    });
};