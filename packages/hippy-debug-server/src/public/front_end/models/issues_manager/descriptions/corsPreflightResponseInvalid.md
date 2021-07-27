# Ensure preflight responses are valid

A cross-origin resource sharing (CORS) request was blocked because the response to the associated [preflight request](issueCorsPreflightRequest) had an unsuccessful HTTP status code and/or was a redirect.

To fix this issue, ensure all CORS preflight `OPTION` requests are answered with a successful HTTP status code (2xx) and do not redirect.
