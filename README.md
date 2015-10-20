# Authentication module
## Requires website API
Previously integrated into the source of [Kashi's Website API](https://bitbucket.org/KashiS/website-api/), this module is responsible for the authentication microservice. This module requires the Website API, an Express application, to function.

Currently implemented is [JWT-based](http://jwt.io) token issuance as well as middleware used by Express to authenticate requests to the API server. The middleware is capable of authenticating JWT strings so that requests can be validated.

## Development roadmap
To be implemented is unit-testing for the authentication model, as well as HTTP-based testing of routes and API behaviours.