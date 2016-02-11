/**
 * Postinstall script
 * Authentication module
 * 
 * These post-install operations will ready the authentication module for 
 * running the Mocha test suite immediately after installation. To do this, the
 * script checks for the presence of an `.env` file and an sqlite database
 * file.
 * 
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 * @version 0.1.0
 */
    
var dotenv = require("dotenv");
var db;

/**
 * Top-level task runner for installation.
 */
function _init() {
    dotenv.config({path: "./.env.example", silent: true});
    dotenv.config({silent: true});
    
    db = require("./database.js");    
    db()
        .then(runTests);
}

function runTests(params) {
    console.log("running tests.");
}

_init();