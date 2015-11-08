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

    describe("Contains database credentials (database)", function() {
        var config = require('../' + CONFIG_FILE_PATH);

        it("Contains host address", function(done) {
            config.database.host.should.be.a.string;
            done();
        });

        it("Contains a username", function(done) {
            config.database.user.should.be.a.string;
            done();
        });

        it("Contains a password", function(done) {
            config.database.password.should.be.a.string;
            done();
        });

        it("Contains a port number", function(done) {
            config.database.port.should.be.a.number;
            done();
        });

        it("Contains a database name", function(done) {
            config.database.database.should.be.a.string;
            done();
        });
    });

    describe("Testing database credentials (databaseTesting)", function() {
        var config = require('../' + CONFIG_FILE_PATH);

        it("Contains host address", function(done) {
            config.databaseTesting.host.should.be.a.string;
            done();
        });

        it("Contains a username", function(done) {
            config.databaseTesting.user.should.be.a.string;
            done();
        });

        it("Contains a password", function(done) {
            config.databaseTesting.password.should.be.a.string;
            done();
        });

        it("Contains a port number", function(done) {
            config.databaseTesting.port.should.be.a.number;
            done();
        });

        it("Contains a database name", function(done) {
            config.databaseTesting.database.should.be.a.string;
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