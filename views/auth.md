# Auth module

The Auth module manages authorisations for API access to various modules. All the various modules hosted on the API server will require access which is managed by this Auth module.

## Authentication tokens

The Auth module may be used to generate an **authentication token**, which is a [JWT encoded string](http://jwt.io/). The authentication token will be supplied to the API server when calling module methods (most of the APIs require that a valid token is supplied).

## Usage

You may retrieve a new authentication token by issuing a `POST /v1/auth/tokens`. The properties of the returned authentication token will vary based on the attributes supplied during creation.

All tokens have both a default and maximum expiry and once a token is created, the properties contained may not be modified. It will be the responsibility of the consuming application to rotate tokens for session persistence.

## Methods

Each of the methods available for this module are documented in further detail on their respective pages.

### [Tokens](tokens/)

Handles the issuance and validation of authentication tokens.