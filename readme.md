# graphql-react

[![npm version](https://img.shields.io/npm/v/graphql-react.svg)](https://npm.im/graphql-react) ![Licence](https://img.shields.io/npm/l/graphql-react.svg) [![Github issues](https://img.shields.io/github/issues/jaydenseric/graphql-react.svg)](https://github.com/jaydenseric/graphql-react/issues) [![Github stars](https://img.shields.io/github/stars/jaydenseric/graphql-react.svg)](https://github.com/jaydenseric/graphql-react/stargazers)

A lightweight GraphQL client for React.

* Adds ~ 4 KB to a typical bundle.
* Native ESM in Node.js via `.mjs`.
* Package `module` entry for tree shaking bundlers.
* Simple child function components; no decorators.
* Uses the new React v16.3 context API.
* GraphQL client usable outside of React components.
* File uploads implement the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).
* 100% overridable per request fetch options.
* Automatic caching based on request hashes:
  * Fresh data fetches when a query component mounts or props update. While loading, results from the last identical request are available to display.
  * Network, parse, and GraphQL errors are cached alongside data; server side rendered errors will be possible.
  * No query tampering.
  * No complicated data denormalization.
  * Queries to multiple GraphQL services can be made without stitching data.

## Setup

Install with [npm](https://npmjs.com):

```shell
npm install graphql-react
```

Create and provide a GraphQL client:

```jsx
import { GraphQL, GraphQLProvider } from 'graphql-react'

const graphql = new GraphQL()

const Page = () => (
  <GraphQLProvider value={graphql}>
    <!-- Can use Query or Mutation components -->
  </GraphQLProvider>
)
```

## GraphQL client

### Options

Zero config required 🔥

#### `requestOptions`

A function that accepts and modifies generated options for every request. Options include `url` (defaults to `/graphql`) and [fetch options](https://github.github.io/fetch/#options). For example:

```js
new GraphQL({
  requestOptions: options => {
    options.url = 'https://api.mycompany.com/graphql'
    options.credentials = 'include'
  }
})
```

#### `cache`

Hydrate the cache. Cache can be exported from a client instance by reading `client.cache`. This option will be more useful when the SSR API is available.

## Support

* Node.js v6.10+, see `package.json` `engines`.
* [Browsers >1% usage](http://browserl.ist/?q=%3E1%25), see `package.json` `browserslist`.
