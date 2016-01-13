# Auth module

The Auth module manages authorisations for API access to various modules. Each od the API server modules will use the Auth module's middleware to authorise API calls.

## Authentication tokens

The API server uses an implementation of OAuth with [JavaScript Web Tokens](http://jwt.io) (JWT), issued by the Auth module and supplied to API server requests by means of the `Authentication` HTTP header.

There are two types of authentication tokens issued by the API server, `auth` tokens and `renew` tokens.

### `Auth` tokens
Auth tokens are used for method authentication by the API server. API server requests must supply an `auth` token with a minimum `AccessLevel` required for the method being called. These tokens have short expiry periods (default 15 minutes) and must be renewed by the client so that they do not _go stale_.

Auth tokens can only be issued by the server when a valid `renew` token is supplied. The resulting `auth` token takes the `AccessLevel` and API key (if present) as the `renew` token against which it was created.

### `Renew` tokens
Renew tokens are issued to clients requesting access to the API server's services. Renew tokens have a long-life expiry (default 730 days) and may only be used to generate temporal `auth` tokens from the API server.

Renew tokens may be created anonymously (`AccessLevel 0`), with an identifying API key (`AccessLevel 1`) or with an API key and its corresponding API key secret (`AccessLevel 2`). Once created, any `auth` tokens generated with the `renew` token will bear the same API key (if present) and `AccessLevel`.

## Usage

You may retrieve a new authentication token by issuing a `POST /v1/auth/tokens.json`. This will supply a pair of tokens, one `renew` token and a corresponding `auth` token.

All tokens have both a default and maximum expiry and once a token is created, the properties contained may not be modified. It will be the responsibility of the consuming application to rotate tokens for session persistence.

## Methods

Each of the methods available for this module are documented in further detail on their respective pages.

### [Tokens](tokens/)

Handles the issuance and validation of authentication tokens.