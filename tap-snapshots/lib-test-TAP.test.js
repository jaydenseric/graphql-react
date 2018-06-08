/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`lib/test TAP Query SSR with fetch unavailable. > GraphQL request cache. 1`] = `
{
  "fetchError": "Global fetch API or polyfill unavailable."
}
`

exports[`lib/test TAP Query SSR with fetch unavailable. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "fetchError": "Global fetch API or polyfill unavailable."
  }
}
`

exports[`lib/test TAP Query SSR with relative fetch URL. > GraphQL request cache. 1`] = `
{
  "fetchError": "Only absolute URLs are supported"
}
`

exports[`lib/test TAP Query SSR with relative fetch URL. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "fetchError": "Only absolute URLs are supported"
  }
}
`

exports[`lib/test TAP Query SSR with HTTP error. > GraphQL request cache. 1`] = `
{
  "httpError": {
    "status": 404,
    "statusText": "Not Found"
  },
  "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
}
`

exports[`lib/test TAP Query SSR with HTTP error. > Query render function arguments. 1`] = `
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

exports[`lib/test TAP Query SSR with response JSON invalid. > GraphQL request cache. 1`] = `
{
  "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
}
`

exports[`lib/test TAP Query SSR with response JSON invalid. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "parseError": "invalid json response body at http://localhost:<port>/ reason: Unexpected token N in JSON at position 0"
  }
}
`

exports[`lib/test TAP Query SSR with response payload malformed. > GraphQL request cache. 1`] = `
{
  "parseError": "Malformed payload."
}
`

exports[`lib/test TAP Query SSR with response payload malformed. > Query render function arguments. 1`] = `
{
  "0": {
    "load": "[Function]",
    "loading": true,
    "parseError": "Malformed payload."
  }
}
`

exports[`lib/test TAP Query SSR with GraphQL errors. > GraphQL request cache. 1`] = `
{
  "httpError": {
    "status": 400,
    "statusText": "Bad Request"
  },
  "graphQLErrors": [
    {
      "message": "GraphQL query syntax error: Syntax Error: Unexpected Name \\"x\\"",
      "locations": [
        {
          line: 1,
          column: 1
        }
      ]
    }
  ]
}
`

exports[`lib/test TAP Query SSR with GraphQL errors. > Query render function arguments. 1`] = `
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
        "message": "GraphQL query syntax error: Syntax Error: Unexpected Name \\"x\\"",
        "locations": [
          {
            line: 1,
            column: 1
          }
        ]
      }
    ]
  }
}
`

exports[`lib/test TAP Query SSR with variables. > GraphQL request cache. 1`] = `
{
  "data": {
    "date": {
      "year": 2018
    }
  }
}
`

exports[`lib/test TAP Query SSR with variables. > Query render function arguments. 1`] = `
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

exports[`lib/test TAP Query SSR with nested query. > HTML displaying the nested query render function argument. 1`] = `
<pre>{"loading":true,"data":{"daysBetween":17532}}</pre>
`

exports[`lib/test TAP Preload legacy React context API components. > HTML. 1`] = `
<div data-reactroot=""><div><p>Context value.</p></div></div>
`
