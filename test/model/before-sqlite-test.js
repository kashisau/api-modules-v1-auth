/**
 * Authentication model - SQLite testing
 *
 * This mechanism inserts an account for testing into the SQLite database that
 * is specified in the config for the Authentication module. If no database
 * file exists then one will be created.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
module.exports = function(apiTestAccount, dbConfig, doneCallback) {
    var sqlite = require('sqlite3'),
        should = require('should'),
        db = new sqlite.Database(dbConfig.file);

    db.on("open", function() {
        db.run(
            [
                'INSERT INTO api_key',
                '(key, secret)',
                'VALUES (?, ?)'
            ].join(" "),
            [
                apiTestAccount.key,
                apiTestAccount.secret
            ],
            function(err) {
                should(err).be.null;
                this.changes.should.be.equal(1);
                this.lastID.should.be.a.number;
                doneCallback();
            }
        );
    });
};