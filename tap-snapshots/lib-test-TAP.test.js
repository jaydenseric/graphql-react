/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`lib/test TAP graphqlFetchOptions with a standard operation. > Fetch options. 1`] = `
{
  "url": "/graphql",
  "method": "POST",
  "headers": {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  "body": "{\\"query\\":\\"\\\\n  {\\\\n    epoch {\\\\n      iso\\\\n    }\\\\n  }\\\\n\\"}"
}
`

exports[`lib/test TAP SSR Query with fetch unavailable. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  Fetch:",
  "    Global fetch API or polyfill unavailable."
]
`

exports[`lib/test TAP SSR Query with fetch unavailable. > GraphQL request cache. 1`] = `
{
  "fetchError": "Global fetch API or polyfill unavailable."
}
`

exports[`lib/test TAP SSR Query with fetch unavailable. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "fetchError": "Global fetch API or polyfill unavailable."
  }
}
`

exports[`lib/test TAP SSR Query with relative fetch URL. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  Fetch:",
  "    Only absolute URLs are supported"
]
`

exports[`lib/test TAP SSR Query with relative fetch URL. > GraphQL request cache. 1`] = `
{
  "fetchError": "Only absolute URLs are supported"
}
`

exports[`lib/test TAP SSR Query with relative fetch URL. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "fetchError": "Only absolute URLs are supported"
  }
}
`

exports[`lib/test TAP SSR Query with HTTP error. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  HTTP:",
  "    Status: 404",
  "    Text: Not Found",
  "  Parse:",
  "    invalid json response body at http://localhost:[port]/ reason: Unexpected token N in JSON at position 0"
]
`

exports[`lib/test TAP SSR Query with HTTP error. > GraphQL request cache. 1`] = `
{
  "httpError": {
    "status": 404,
    "statusText": "Not Found"
  },
  "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
}
`

exports[`lib/test TAP SSR Query with HTTP error. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "httpError": {
      "status": 404,
      "statusText": "Not Found"
    },
    "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
  }
}
`

exports[`lib/test TAP SSR Query with response JSON invalid. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  Parse:",
  "    invalid json response body at http://localhost:[port]/ reason: Unexpected token N in JSON at position 0"
]
`

exports[`lib/test TAP SSR Query with response JSON invalid. > GraphQL request cache. 1`] = `
{
  "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
}
`

exports[`lib/test TAP SSR Query with response JSON invalid. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
  }
}
`

exports[`lib/test TAP SSR Query with response payload malformed. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  Parse:",
  "    Malformed payload."
]
`

exports[`lib/test TAP SSR Query with response payload malformed. > GraphQL request cache. 1`] = `
{
  "parseError": "Malformed payload."
}
`

exports[`lib/test TAP SSR Query with response payload malformed. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "parseError": "Malformed payload."
  }
}
`

exports[`lib/test TAP SSR Query with GraphQL errors. > Console log. 1`] = `
[
  "GraphQL request (hash “[hash]”) errors:",
  "  HTTP:",
  "    Status: 400",
  "    Text: Bad Request",
  "  GraphQL:",
  "    Cannot query field \\"x\\" on type \\"Query\\"."
]
`

exports[`lib/test TAP SSR Query with GraphQL errors. > GraphQL request cache. 1`] = `
{
  "httpError": {
    "status": 400,
    "statusText": "Bad Request"
  },
  "graphQLErrors": [
    {
      "message": "Cannot query field \\"x\\" on type \\"Query\\".",
      "locations": [
        {
          "line": 1,
          "column": 3
        }
      ]
    }
  ]
}
`

exports[`lib/test TAP SSR Query with GraphQL errors. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "httpError": {
      "status": 400,
      "statusText": "Bad Request"
    },
    "graphQLErrors": [
      {
        "message": "Cannot query field \\"x\\" on type \\"Query\\".",
        "locations": [
          {
            "line": 1,
            "column": 3
          }
        ]
      }
    ]
  }
}
`

exports[`lib/test TAP SSR Query with variables. > GraphQL request cache. 1`] = `
{
  "data": {
    "date": {
      "year": 2018
    }
  }
}
`

exports[`lib/test TAP SSR Query with variables. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "data": {
      "date": {
        "year": 2018
      }
    }
  }
}
`

exports[`lib/test TAP SSR Query with nested query. > HTML displaying the nested query render function argument. 1`] = `
<pre>{
  "load": "[Function]",
  "loading": true,
  "data": {
    "daysBetween": 17532
  }
}</pre>
`
