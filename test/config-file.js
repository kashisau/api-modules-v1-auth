'use strict';
/**
 * Authentication module - config file testing
 *
 * This suite of tests verifies that the config file contains the correct
 * parameters for testing purposes. This is a unit test that does not verify
 * credentials, etc.
 *
 * @author Kashi Samaraweera <kashi@kashis.com.au>
 */
describe('Config file checks', function() {

    var CONFIG_FILE_PATH = 'config/config.json';

    it("Config file exists in /config/config.json", function(done) {
        var fs = require('fs'),
        configFileStats;

        (function() {
        configFileStats = fs.lstatSync(CONFIG_FILE_PATH);
        (configFileStats.isFile()).should.be.true;
        }).should.not.throw();

        done();
    });

    describe("Contains SQLite data", function() {
        var config = require('../' + CONFIG_FILE_PATH);

        it("Contains sqlite database file", function(done) {
            config.database.file.should.be.a.string;
            done();
        });
    });
    
    describe("JWT signing key", function() {
        var config = require('../' + CONFIG_FILE_PATH);

        it("Specifies a JWT signing key for use by the server", function(done)  {
            config.jwtSigningKey.should.be.a.string;
            done();
        });

        it("Is a key of sufficient length", function(done) {
            config.jwtSigningKey.length.should.be.greaterThan(32);
            done();
        });

    });

});