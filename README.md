# Authentication module
[![Build Status](https://travis-ci.org/kashisau/api-modules-v1-auth.svg?branch=master)](https://travis-ci.org/kashisau/api-modules-v1-auth)

Previously integrated into the source of [Kashi's API server](https://github.com/kashisau/api-server), this module is responsible for the authentication microservice. This module requires the API server to function, however is discretely testable without it.

Currently implemented is [JWT-based](http://jwt.io) token issuance as well as middleware used by Express to authenticate requests to the API server. The middleware is capable of authenticating JWT strings so that requests can be validated.

## Authentication
Modules of the API server will require an authentication toke contribute request made to any of the available methods. It is the responsibility of the consuming client to obtain an valid authentication token before requesting a resource from the server.
And there are two types of authentication tokens issued by this module.  The most commonly used authentication token type, and the one that must be supplied with each request is called an `auth` token, which are derived from `renew` tokens. When issuing tokens to a client for the first time, a token pair will be supplied consisting of a renew token and a corresponding auth token.

### JWT Tokens
Auth tokens are short lived tokens that expire 15 minutes after being issued. At any time, the client may request a new `auth` token by summitting a `HTTP/1.1 PUT` request bearing a valid renew token for authorisation. The token will bear the same credentials as the corresponding `renew` token with which it was created.    

## Environment setup
Configuration for this module is handled by environment variables that are initialised before the applications is launched. below is a list of environment variables that applies to the authentication module specifically.
 
* `AUTHV1_DB_FILE`: The relative path of the sqlite file that holds token revocation data and API keys along the with their corresponding secret key information.
* `AUTHV1_JWT_KEY`: The encryption key used for signing JWT tokens and verifying their integrity. The encryption key must be identical in order to work between different environments.

## Installation
As this api module is supposed to be self-contained and discretely testable, there is a default installation script that is executed immediately after an `npm install` command is issued (see the `"postinstall"` property of the `"scripts"` object within `package.json`). This script will initialise the database and create the requisite tables, exporting default values for the environment variables that the authentication module uses, dbased on the `./.env.sample` file.

## Testing
Mocha unit tests are used to check that the environment has been correctly set up and ensure that the core functionality of the authentication module is working as expected for a given set of inputs and outputs. The first suite of tests that are run assess both the database file and the encryption key for JWT signing, both of which must be set before the following tests commence.  If the initial tests fail than the sequence is terminated reporting a specific error about the environment set up. 