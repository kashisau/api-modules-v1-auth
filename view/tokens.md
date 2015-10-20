# Tokens methods
## Auth module

The Tokens method handles the issuing, validation and revocation of authentication tokens that are used by the API server. The API server will track all authentication tokens that have been issued and keep a record of activity for each one.

## Methods

### `POST` tokens [AccessLevel 0]

Used to request a new authentication token got use with API modules. Authentication tokens vary in [access level](../../#Authorisation) depending on the data provided during creation.

#### Required attributes

There are no mandatory attributes required to create an authentication token of access level 1. If no post information is supplied, then a new token of access level 1 will be provided.

| Property | Value(s) | Description |
|----------|----------|-------------|
| (none)   | -        | -           |

#### Optional attributes

There are three access levels that an authentication token may posses. The following set of attributes must be supplied for access level 2.

| Attribute | Value(s)             | Description                                                                                                                              |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey    | `<your API key>`     | The API key that has been issued to identify an individual account  holder. This is merely used to identify the user of the api service. |

The highest access level is for authenticated consumers, who must supply both an API key and the correseponding secret key. This will generate an authentication token with access level 3.

| Attribute | Value(s)                     | Description                                                                                                                              |
| --------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey    | `<your API key>`             | The API key that has been issued to identify an individual account  holder. This is merely used to identify the user of the api service. |
| secretKey | `<corresponding secret key>` | The secret key that corresponds to the supplied APIKey                                                                                   |

#### Expected response

The command will respond with a JWT character string of up to 200 characters. This character string must be included in the head of API calls that have an access level of 1 or more.

A JSON API compatible response will contain the authentication token.

``` json
{
  "data": {
    "authenticationToken" : "aaaaa.bbbbb.ccccc",
    "expirySeconds" : 7200
  }
}
```

#### Method-specific errors

Note: Please see the [standard errors](../errors) section for details of generic API errors.

* `api_key_invalid` - The supplied `APIKey` attribute was not recognised as a valid API key.
* `api_key_malformed` - The supplied `APIKey` attribute was not in the correct format (i.e., it does not contain the correct number of characters).
* `secret_key_invalid` - The supplied `SecretKey` does not correspond to the `APIKey` attribute
* `secret_key_malformed` - The supplied `SecretKey` does not correspond to the `APIKey` attribute

### `GET` tokens [AccessLevel 3]
Retrieves a list of authentication tokens that have been issued by the system. Please note that **whole tokens will not be retrieved**.

#### Required attributes

| Attribute           | Value(s)                 | Description                                       |
| ------------------- | ------------------------ | ------------------------------------------------- |
| authenticationToken | `<authentication token>` | A valid authentication token with access level 3. |

#### Optional attributes

| Attribute | Value(s)                                                      | Default  | Description                                                                                                                                 |
| --------- | ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| count     | 1-1000                                                        | 100      | Determines the number of tokens that will be returned.                                                                                      |
| offset    | ℤ                                                             | 0        | The offset (beginning 0) from which to begin the set of results.                                                                            |
| sort      | `[-]issued`&#124;`[-]expiry`&#124;`[-]accessLevel`&#124;`[-]apiKey` [,`[-]issued`&#124;`[-]expiry`&#124;`[-]accessLevel`&#124;`[-]apiKey`,...] | `issued` (ascending) | Determines the sort order of the result set, before being (optionally) limited by the count and offset attributes. Sort orders can be supplied in order of preference by separating each property with a comma (`,`). Each sort property may be appended with a unary minus (`-`) to indicate a descending sort order (eg. `sort=-expiry,issue,-apikey`) |

#### Expected response

A list of tokens in use by the API server, both valid and invalid will be returned. They will adhere to the following structure:

```
{
  "data": {
    "authenticationTokens" : [
      {
        "authenticationToken" : "aa***.*****.****cc",
        "apiKey" : "abcd***********f",
        "secretKey" : null,
        "expirySeconds" : 1252
      },
      {
        "authenticationToken" : "bb***.*****.****dd",
        "apiKey" : "abcd***********f",
        "secretKey" : null,
        "expirySeconds" : 1532
      },
      ...
      {
        "authenticationToken" : "yy***.*****.****zz",
        "apiKey" : "abcd***********f",
        "secretKey" : null,
        "expirySeconds" : -1235
      },
    ]
  }
}
```
#### Method-specific errors

Note: Please see the [standard errors](../errors) section for details of generic API errors.

* `count_invalid` - The supplied `count` attribute was not a valid natural number or out of bounds.
* `offset_invalid` - The supplied `offset` attribute was out of bounds.
* `sort_malformed` - The server had difficulty parsing the sort order indicated. Check that the sort follows the specified conventions.

### `GET` tokens/:authentication-token [AccessLevel 1]

Validates an authentication, returning information about its issue and validity. The server will return details about the token being supplied in the URL (`:authentication-token`), not the authentication token supplied for authorisation.

#### Required attributes
Note that the token that is being specified in the URL does _not_ need to match the token used to authorise the method call.

| Attribute           | Value(s)                 | Description                                       |
| ------------------- | ------------------------ | ------------------------------------------------- |
| authenticationToken | `<authentication token>` | A valid authentication token with access level 1. |

#### Optional attributes
There are optional attributes for this method.

| Property | Value(s) | Description |
|----------|----------|-------------|
| (none)   | -        | -           |

#### Expected response
Details of the token will be returned regarding its validity.
```
{
  "data": {
    "status": "expired",
    "expirySeconds" : -60402
  }
} 
```

#### Method-specific errors
Note: Please see the [standard errors](../errors) section for details of generic API errors.

* `authentication_token_malformed` - A syntax error was present in the URL-supplied authorisation token.
* `authentication_token_invalid` - The authentication token was not recognised by the system.

### `DELETE` tokens/:authentication-token [AccessLevel 1]

Invalidates an authentication token by storing an invalidation rule in the server. The supplied authentication token will no longer be functional after this method has been called.

#### Required attributes
An authentication token must be supplied for authorisation.

| Attribute           | Value(s)                 | Description                                                 |
| ------------------- | ------------------------ | ----------------------------------------------------------- |
| authenticationToken | `<authentication token>` | A valid authentication token used to authorise the request. |

##### Note
If an authentication token of access level 1 is supplied, it may only be used invalidate itself. See Optional attributes below for administrative deletion of authentication tokens.

#### Optional attributes
There are optional attributes for this method that override the required attributes. Higher access levels may delete authentication tokens that are non-matching nor share the same API key.

| Property            | Value(s)                 | Description                                                                                                                                                               |
|---------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| authenticationToken | `<authentication token>` | A valid authentication token with access level 2. This may be used to delete authentication tokens that are created against the same API key.                             |
| authenticationToken | `<authentication token>` | A valid authentication token with access level 3. This may be used to delete authentication tokens different to the token specified in the request (without restriction). |

#### Expected response
Details of the token will be returned regarding its new status and a timestamp of its invalidation.
```
{
  "data": {
    "authenticationToken": "aaaa.bbbb.cccc",
    "status" : "invalid",
    "lastActive" : "2015-07-01 12:30:00 +1000"
  }
}
```

#### Method-specific errors
Note: Please see the [standard errors](../errors) section for details of generic API errors.

* `authentication_token_malformed` - A syntax error was present in the URL-supplied authorisation token.
* `authentication_token_invalid` - The authentication token was not recognised by the system.