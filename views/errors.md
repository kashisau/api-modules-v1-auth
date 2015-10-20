# Auth module errors

The Authentication module has method-specific errors that apply to each method that may be accessed, however the following generic errors apply to all methods of the module.

## Error: `auth_token_missing`

Thrown if a request that requires authentication was not provided with an authentication token. Please check that the request has a JWT string in its header (as authenticationToken).

## Error: `insufficient_authorisation`

This error will be returned if the method being accessed requires a higher access level than the token supplied for authorisation. For further support, see the documentation of the method being acccessed, which should specify the required access level.