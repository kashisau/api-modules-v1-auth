/**
 * Database initalisation
 * 
 * The Auth module uses an sqlite database for its revocation list (renew
 * tokens that are invalidated). This database is stored on a local file, the
 * location of which is defined in an environment variable AUTH_V1_DB_FILE.
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */

var DB_FILE = process.env.AUTHV1_DB_FILE;
var sql = require("sqlite3");
var path = require("path");
var fs = require("fs-extra");

/**
 * Initalises our database, creating the sqlite file at the location defined in
 * the AUTH_V1_DB_FILE environment variable.
 */
function init() {
    return new Promise(
        (resolve, reject) => {
            if (!DB_FILE) return reject((() => {
                var e = new Error("Database file path not set (AUTHV1_DB_FILE"
                    + ").");
                e.name = "auth_db_missing_file_path";
                return e;
            })());
            
            var dbFilePath = path.join(__dirname, "../", DB_FILE);
            
            return resolve(
                checkDBPath(dbFilePath)
                    .then(openDB)
                    .then(createDB)
            );
        }
    )
}

/**
 * Checks to see if the path to our database exists, if not, one is created
 * according to the supplied path.
 * @param {string} filePath The path to the sqlite file that will host the Auth
 *                          database.
 * @return {Promise.<string>}   Returns the supplied file path.
 */
function checkDBPath(filePath) {
    return new Promise((resolve, reject) => {
        var dirPath = path.dirname(filePath);

        fs.ensureDir(dirPath, dirCheckCallback);

        function dirCheckCallback(err) {
            if (err) {
                err.dbFilePath = filePath;
                return reject(err);
            }
            return resolve(filePath);
        }
    });    
}

/**
 * Opens an existing database file with the path supplied. If the database does
 * not exist at the supplied filename then an error is thrown.
 * @param {string} dbFile   The path of the sqlite database file used by the 
 *                          Authentication module.
 * @return {Promise.<sqlite3.Database>} Returns the sqlite3 Database object for
 *                                      validation.
 */
function openDB(dbFile) {
    return new Promise((resolve, reject) => {
        
        var db = new sql.Database(
            dbFile,
            sql.OPEN_READWRITE | sql.OPEN_CREATE,
            dbOpenCallback
        );
        
        function dbOpenCallback(err) {
            if (err) return reject(err);
            return resolve(db);
        }
    });
}

/**
 * Creates the tables for renew token revocation and API key management if they
 * do not already exist.
 * @param {sqlite3.Database} db An initialised instance of an sqlite database
 *                              that will host (or already hosts) auth data.
 *                              If this database already contains the required
 *                              tables then no changes will be made, otherwise
 *                              the tables will be created.
 * @return {Promise.<sqlite3.Database>} Returns the sqlite3 Database object for
 *                                      validation.
 */
function createDB(db) {
    return new Promise((resolve, reject) => {
        
        db.exec(
            "\
            CREATE TABLE IF NOT EXISTS `token_revoked` (\
                `token`	TEXT NOT NULL UNIQUE,\
                `date`	INTEGER NOT NULL,\
                `jti`	TEXT NOT NULL UNIQUE,\
                PRIMARY KEY(token)\
            );\
            CREATE TABLE IF NOT EXISTS `api_key` (\
                `key`	TEXT NOT NULL UNIQUE,\
                `secret`	TEXT NOT NULL UNIQUE,\
                `status`	TEXT DEFAULT 'UNINTIALISED',\
                PRIMARY KEY(key)\
            );",
            createCallback
        );

        function createCallback(err) {
            if (err) return reject(err);
            return resolve(db);
        }
        
    });
}

module.exports = init;