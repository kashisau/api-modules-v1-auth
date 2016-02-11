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

var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');


/**
 * Top-level task runner for installation.
 */
function _init() {
    dotenv.config({path: "./.env.example", silent: true});
    dotenv.config({silent: true});
    
    db = require("./database.js");    
    
    db().catch(dbError).then((s,j) => process.exit(+s));
}

/**
 * Reports an error in the initalisation of the sqlite database.
 */
function dbError(err) {
    return new Promise((resolve, reject) => {
       console.error("Error initialising database: ", err);
       resolve(1);
    });
}

_init();