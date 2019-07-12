![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

[![npm version](https://badgen.net/npm/v/graphql-react)](https://npm.im/graphql-react) [![Build status](https://travis-ci.org/jaydenseric/graphql-react.svg?branch=master)](https://travis-ci.org/jaydenseric/graphql-react)

A lightweight but powerful GraphQL client for React using modern [context](https://reactjs.org/docs/context) and [hooks](https://reactjs.org/docs/hooks-intro) APIs; the first [Relay](https://facebook.github.io/relay) and [Apollo](https://apollographql.com/docs/react) alternative with server side rendering.

- [Apollo comparison](#apollo-comparison)
- [Setup](#setup)
- [Usage](#usage)
- [Examples](#examples)
- [Support](#support)
- [API](#api)

## Apollo comparison

### Bundle impact

#### graphql-react

A &lt; 2.5 KB bundle impact is guaranteed by [`size-limit`](https://npm.im/size-limit) tests. The impact is smaller than the bundle size badge suggests as the internal [`object-assign`](https://npm.im/object-assign) dependency is shared with [`react`](https://npm.im/react).

| Dependency | Install size | Bundle size |
| --- | --- | --- |
| [`graphql-react`](https://npm.im/graphql-react) | [![graphql-react install size](https://badgen.net/packagephobia/install/graphql-react)](https://packagephobia.now.sh/result?p=graphql-react) | [![graphql-react minzipped size](https://badgen.net/bundlephobia/minzip/graphql-react)](https://bundlephobia.com/result?p=graphql-react) |

[Tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers will eliminate unused exports (perhaps [`reportCacheErrors`](#function-reportcacheerrors)).

#### Apollo

Several dependencies must be installed for a minimal Apollo project.

| Dependency | Install size | Bundle size |
| --- | --- | --- |
| [`apollo-boost`](https://npm.im/apollo-boost) | [![apollo-boost install size](https://badgen.net/packagephobia/install/apollo-boost)](https://packagephobia.now.sh/result?p=apollo-boost) | [![apollo-boost minzipped size](https://badgen.net/bundlephobia/minzip/apollo-boost)](https://bundlephobia.com/result?p=apollo-boost) |
| [`react-apollo`](https://npm.im/react-apollo) | [![react-apollo install size](https://badgen.net/packagephobia/install/react-apollo)](https://packagephobia.now.sh/result?p=react-apollo) | [![react-apollo minzipped size](https://badgen.net/bundlephobia/minzip/react-apollo)](https://bundlephobia.com/result?p=react-apollo) |
| [`graphql-tag`](https://npm.im/graphql-tag) | [![graphql-tag install size](https://badgen.net/packagephobia/install/graphql-tag)](https://packagephobia.now.sh/result?p=graphql-tag) | [![graphql-tag minzipped size](https://badgen.net/bundlephobia/minzip/graphql-tag)](https://bundlephobia.com/result?p=graphql-tag) |
| [`graphql`](https://npm.im/graphql) | [![graphql install size](https://badgen.net/packagephobia/install/graphql)](https://packagephobia.now.sh/result?p=graphql) | [![graphql minzipped size](https://badgen.net/bundlephobia/minzip/graphql)](https://bundlephobia.com/result?p=graphql) |

[Tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers will eliminate unused [`graphql`](https://npm.im/graphql) exports.

In addition, [fragment matcher](https://www.apollographql.com/docs/react/advanced/fragments#fragment-matcher) config impacts bundle size relative to the number and complexity of schema unions and interfaces; see [**_Cache strategy_**](#cache-strategy).

### Native ESM

#### graphql-react

Supports native ESM via `.mjs` files for Node.js in [`--experimental-modules`](https://nodejs.org/api/esm.html#esm_enabling) mode and [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers like [webpack](https://webpack.js.org). For legacy environments CJS is provided via `.js` files.

#### Apollo

No support for native ESM, although they do provide faux ESM via package `module` fields for [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers like [webpack](https://webpack.js.org).

### Writing queries

#### graphql-react

Uses template strings:

```js
const QUERY = /* GraphQL */ `
  {
    viewer {
      id
    }
  }
`
```

The optional `/* GraphQL */` comment signals the syntax for highlighters and linters.

#### Apollo

Uses template strings tagged with `gql` from [`graphql-tag`](https://npm.im/graphql-tag):

```js
import gql from 'graphql-tag'

const QUERY = gql`
  {
    viewer {
      id
    }
  }
`
```

### Cache strategy

#### graphql-react

The [`GraphQL`](#class-graphql) client has no GraphQL API specific config; [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options are determined on demand at the component level. Multiple GraphQL APIs can be queried!

GraphQL operations are cached under hashes of their [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options. Multiple operations with the same hash share the same loading status and cache value.

[`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API), HTTP, parse and GraphQL errors can be cached, and therefore server side rendered and transported to the client for hydration and initial render.

#### Apollo

Apollo Client is configured for one GraphQL API per app.

GraphQL operation data is deconstructed based upon `id` and `__typename` fields into a “[normalized](https://apollographql.com/docs/react/advanced/caching#normalization)” cache. These fields must be queried even if they aren’t used in components.

[Errors aren’t cached](https://github.com/apollographql/apollo-client/issues/3897#issuecomment-432982170), and therefore can’t be server side rendered and transported to the client for hydration and initial render.

Apollo Client must be configured with schema knowledge extracted at build time for a “[fragment matcher](https://apollographql.com/docs/react/advanced/fragments#fragment-matcher)” to cache fragments on unions and interfaces properly. It’s challenging to reconfigure and redeploy clients whenever the GraphQL schema updates. Also, the config increases the client bundle size; see [**_Bundle impact_**](#bundle-impact).

### Stale cache

#### graphql-react

By default, cache is refreshed for mounting components.

GraphQL operations can optionally refresh all cache except their own fresh cache; handy for mutations.

#### Apollo

By default, cache isn’t refreshed for mounting components.

GraphQL mutations only update the cache with the contents of their payload. The prescribed approach is to try to manually update other normalized cache after mutations using complicated and often buggy APIs. Resetting all cache is possible, but it also wipes the result of the last operation.

### File uploads

#### graphql-react

Out of the box file uploads compliant with the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec) (authored by [@jaydenseric](https://github.com/jaydenseric)) which is supported by popular GraphQL servers including [Apollo Server](https://apollographql.com/docs/apollo-server). File input values can be used as query or mutation arguments.

#### Apollo

Supports file uploads if you drop [`apollo-boost`](https://npm.im/apollo-boost) and manually setup Apollo Client with [`apollo-upload-client`](https://npm.im/apollo-upload-client) (also by [@jaydenseric](https://github.com/jaydenseric)).

### Subscriptions

#### graphql-react

Not supported yet.

#### Apollo

Supported.

### TypeScript

#### graphql-react

Written in ECMAScript; no types are exported.

#### Apollo

Written in TypeScript; types are exported.

### Next.js integration

#### graphql-react

Has [an official example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react) using [`next-graphql-react`](https://npm.im/next-graphql-react), which provides easy an easy to install [`App`](https://nextjs.org/docs/#custom-app) decorator and [plugin](https://nextjs.org/docs/#custom-configuration) to enable server side rendered GraphQL queries.

#### Apollo

Has [an official example](https://github.com/zeit/next.js/tree/canary/examples/with-apollo), but it consists of over 100 lines of complicated copy-paste boilerplate code across multiple files.

## Setup

### Next.js setup

See the [`next-graphql-react`](https://npm.im/next-graphql-react) setup instructions.

### Vanilla React setup

To install [`graphql-react`](https://npm.im/graphql-react) from [npm](https://npmjs.com) run:

```sh
npm install graphql-react
```

Create a single [`GraphQL`](#class-graphql) instance and use [`GraphQLProvider`](#function-graphqlprovider) to provide it for your app.

For server side rendering see [`ssr()`](#function-ssr).

## Usage

Use the [`useGraphQL`](#function-usegraphql) React hook in your components to make queries and mutations, or use the [`GraphQL` instance method `operate`](#graphql-instance-method-operate) directly.

## Examples

- [The official Next.js example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react).
- [The Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

## Support

- Node.js v8.5+
- Browsers [`> 0.5%, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+dead)

Consider polyfilling:

- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)

## API

### Table of contents

- [class GraphQL](#class-graphql)
  - [See](#see)
  - [Examples](#examples)
  - [GraphQL instance method off](#graphql-instance-method-off)
  - [GraphQL instance method on](#graphql-instance-method-on)
    - [See](#see-1)
  - [GraphQL instance method operate](#graphql-instance-method-operate)
  - [GraphQL instance method reload](#graphql-instance-method-reload)
    - [Examples](#examples-1)
  - [GraphQL instance method reset](#graphql-instance-method-reset)
    - [Examples](#examples-2)
  - [GraphQL instance property cache](#graphql-instance-property-cache)
    - [Examples](#examples-3)
  - [GraphQL instance property operations](#graphql-instance-property-operations)
- [function GraphQLProvider](#function-graphqlprovider)
  - [See](#see-2)
  - [Examples](#examples-4)
- [function reportCacheErrors](#function-reportcacheerrors)
  - [Examples](#examples-5)
- [function ssr](#function-ssr)
  - [See](#see-3)
  - [Examples](#examples-6)
- [function useGraphQL](#function-usegraphql)
  - [See](#see-4)
  - [Examples](#examples-7)
- [constant GraphQLContext](#constant-graphqlcontext)
  - [See](#see-5)
  - [Examples](#examples-8)
- [type GraphQLCache](#type-graphqlcache)
  - [See](#see-6)
- [type GraphQLCacheKey](#type-graphqlcachekey)
- [type GraphQLCacheValue](#type-graphqlcachevalue)
- [type GraphQLFetchOptions](#type-graphqlfetchoptions)
  - [See](#see-7)
- [type GraphQLFetchOptionsOverride](#type-graphqlfetchoptionsoverride)
  - [See](#see-8)
  - [Examples](#examples-9)
- [type GraphQLOperation](#type-graphqloperation)
  - [See](#see-9)
- [type GraphQLOperationLoading](#type-graphqloperationloading)
  - [See](#see-10)
- [type GraphQLOperationStatus](#type-graphqloperationstatus)
  - [See](#see-11)
- [type HttpError](#type-httperror)
- [type ReactNode](#type-reactnode)

### class GraphQL

A lightweight GraphQL client that caches queries and mutations.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object? = `{}` | Options. |
| `options.cache` | [GraphQLCache](#type-graphqlcache)? = `{}` | Cache to import; usually from a server side render. |

#### See

- [`reportCacheErrors`](#function-reportcacheerrors) to setup error reporting.

#### Examples

_Construct a GraphQL client._

> ```js
> import { GraphQL } from 'graphql-react'
>
> const graphql = new GraphQL()
> ```

#### GraphQL instance method off

Removes an event listener.

| Parameter | Type     | Description    |
| :-------- | :------- | :------------- |
| `type`    | string   | Event type.    |
| `handler` | Function | Event handler. |

#### GraphQL instance method on

Adds an event listener.

| Parameter | Type     | Description    |
| :-------- | :------- | :------------- |
| `type`    | string   | Event type.    |
| `handler` | Function | Event handler. |

##### See

- [`reportCacheErrors`](#function-reportcacheerrors) can be used with this to setup error reporting.

#### GraphQL instance method operate

Loads or reuses an already loading GraphQL operation in [GraphQL operations](#graphql-instance-property-operations). Emits a [`GraphQL`](#class-graphql) instance `fetch` event if an already loading operation isn’t reused, and a `cache` event once it’s loaded into the [GraphQL cache](#graphql-instance-property-cache).

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object | Options. |
| `options.operation` | [GraphQLOperation](#type-graphqloperation) | GraphQL operation. |
| `options.fetchOptionsOverride` | [GraphQLFetchOptionsOverride](#type-graphqlfetchoptionsoverride)? | Overrides default GraphQL operation [`fetch` options](#type-graphqlfetchoptions). |
| `options.reloadOnLoad` | boolean? = `false` | Should a [GraphQL reload](#graphql-instance-method-reload) happen after the operation loads, excluding the loaded operation cache. |
| `options.resetOnLoad` | boolean? = `false` | Should a [GraphQL reset](#graphql-instance-method-reset) happen after the operation loads, excluding the loaded operation cache. |

**Returns:** [GraphQLOperationLoading](#type-graphqloperationloading) — Loading GraphQL operation details.

#### GraphQL instance method reload

Signals that [GraphQL cache](#graphql-instance-property-cache) subscribers such as the [`useGraphQL`](#function-usegraphql) React hook should reload their GraphQL operation. Emits a [`GraphQL`](#class-graphql) instance `reload` event.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | A [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache to exempt from reloading. |

##### Examples

_Reloading the [GraphQL cache](#graphql-instance-property-cache)._

> ```js
> graphql.reload()
> ```

#### GraphQL instance method reset

Resets the [GraphQL cache](#graphql-instance-property-cache), useful when a user logs out. Emits a [`GraphQL`](#class-graphql) instance `reset` event.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | A [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache to exempt from deletion. Useful for resetting cache after a mutation, preserving the mutation cache. |

##### Examples

_Resetting the [GraphQL cache](#graphql-instance-property-cache)._

> ```js
> graphql.reset()
> ```

#### GraphQL instance property cache

Cache of loaded GraphQL operations. You probably don’t need to interact with this unless you’re implementing a server side rendering framework.

**Type:** [GraphQLCache](#type-graphqlcache)

##### Examples

_Export cache as JSON._

> ```js
> const exportedCache = JSON.stringify(graphql.cache)
> ```

_Example cache JSON._

> ```json
> {
>   "a1bCd2": {
>     "data": {
>       "viewer": {
>         "name": "Jayden Seric"
>       }
>     }
>   }
> }
> ```

#### GraphQL instance property operations

A map of loading GraphQL operations. You probably don’t need to interact with this unless you’re implementing a server side rendering framework.

**Type:** object&lt;[GraphQLCacheKey](#type-graphqlcachekey), Promise&lt;[GraphQLCacheValue](#type-graphqlcachevalue)>>

---

### function GraphQLProvider

A React component that provides a [`GraphQL`](#class-graphql) instance for an app.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `props` | object | Component props. |
| `props.graphql` | [GraphQL](#class-graphql) | [`GraphQL`](#class-graphql) instance. |
| `props.children` | [ReactNode](#type-reactnode)? | React children. |

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

#### See

- [`GraphQLContext`](#constant-graphqlcontext) is provided via this component.
- [`useGraphQL`](#function-usegraphql) React hook requires this component to be an ancestor to work.

#### Examples

_Provide a [`GraphQL`](#class-graphql) instance for an app._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react'
>
> const graphql = new GraphQL()
>
> const App = ({ children }) => (
>   <GraphQLProvider graphql={graphql}>{children}</GraphQLProvider>
> )
> ```

---

### function reportCacheErrors

A [`GraphQL`](#class-graphql) `cache` event handler that reports [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API), HTTP, parse and GraphQL errors via `console.log()`. In a browser environment the grouped error details are expandable.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `data` | object | [`GraphQL`](#class-graphql) `cache` event data. |
| `data.cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey). |
| `data.cacheValue` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [value](#type-graphqlcachevalue). |

#### Examples

_[`GraphQL`](#class-graphql) initialized to report cache errors._

> ```js
> import { GraphQL, reportCacheErrors } from 'graphql-react'
>
> const graphql = new GraphQL()
> graphql.on('cache', reportCacheErrors)
> ```

---

### function ssr

Asynchronously server side renders a [React node](#type-reactnode), preloading all GraphQL queries set to `loadOnMount`. After resolving, cache can be exported from the [`GraphQL` instance property `cache`](#graphql-instance-property-cache) for serialization (usually to JSON) and transport to the client for hydration via the [`GraphQL` constructor parameter `options.cache`](#class-graphql).

Be sure to globally polyfill [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API).

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `graphql` | [GraphQL](#class-graphql) | [`GraphQL`](#class-graphql) instance. |
| `node` | [ReactNode](#type-reactnode) | React virtual DOM node. |
| `render` | Function? = `ReactDOMServer.renderToStaticMarkup` | Synchronous React server side render function, defaulting to [`ReactDOMServer.renderToStaticMarkup`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) as it is more efficient than [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring). |

**Returns:** Promise&lt;string> — Promise resolving the rendered HTML string.

#### See

- [`ReactDOMServer` docs](https://reactjs.org/docs/react-dom-server).
- [`next-graphql-react`](https://npm.im/next-graphql-react) to use this API in a [Next.js](https://nextjs.org) project.

#### Examples

_SSR function that resolves a HTML string and cache JSON for client hydration._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react'
> import { ssr } from 'graphql-react/server'
> import ReactDOMServer from 'react-dom/server'
> import { App } from './components'
>
> async function render() {
>   const graphql = new GraphQL()
>   const page = (
>     <GraphQLProvider graphql={graphql}>
>       <App />
>     </GraphQLProvider>
>   )
>   const html = await ssr(graphql, page, ReactDOMServer.renderToString)
>   const cache = JSON.stringify(graphql.cache)
>   return { html, cache }
> }
> ```

_SSR function that resolves a HTML string suitable for a static page._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react'
> import { ssr } from 'graphql-react/server'
> import { App } from './components'
>
> function render() {
>   const graphql = new GraphQL()
>   const page = (
>     <GraphQLProvider graphql={graphql}>
>       <App />
>     </GraphQLProvider>
>   )
>   return ssr(graphql, page)
> }
> ```

---

### function useGraphQL

A [React hook](https://reactjs.org/docs/hooks-intro) to manage a GraphQL operation in a component.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object | Options. |
| `options.fetchOptionsOverride` | [GraphQLFetchOptionsOverride](#type-graphqlfetchoptionsoverride)? | Overrides default [`fetch` options](#type-graphqlfetchoptions) for the GraphQL operation. |
| `options.loadOnMount` | boolean? = `true` | Should the operation load when the component mounts. |
| `options.loadOnReload` | boolean? = `true` | Should the operation load when the [`GraphQL`](#class-graphql) `reload` event fires, if the operation was not the one that caused the reload. |
| `options.loadOnReset` | boolean? = `true` | Should the operation load when its [GraphQL cache](#graphql-instance-property-cache) [value](#type-graphqlcachevalue) is reset, if the operation was not the one that caused the reset. |
| `options.reloadOnLoad` | boolean? = `false` | Should a [GraphQL reload](#graphql-instance-method-reload) happen after the operation loads, excluding the loaded operation cache. |
| `options.resetOnLoad` | boolean? = `false` | Should a [GraphQL reset](#graphql-instance-method-reset) happen after the operation loads, excluding the loaded operation cache. |
| `options.operation` | [GraphQLOperation](#type-graphqloperation) | GraphQL operation. |

**Returns:** [GraphQLOperationStatus](#type-graphqloperationstatus) — GraphQL operation status.

#### See

- [`GraphQLContext`](#constant-graphqlcontext) is required for this hook to work.

#### Examples

_A component that displays a Pokémon image._

> ```jsx
> import { useGraphQL } from 'graphql-react'
>
> const PokemonImage = ({ name }) => {
>   const { loading, cacheValue = {} } = useGraphQL({
>     fetchOptionsOverride(options) {
>       options.url = 'https://graphql-pokemon.now.sh'
>     },
>     operation: {
>       query: `{ pokemon(name: "${name}") { image } }`
>     }
>   })
>
>   return cacheValue.data ? (
>     <img src={cacheValue.data.pokemon.image} alt={name} />
>   ) : loading ? (
>     'Loading…'
>   ) : (
>     'Error!'
>   )
> }
> ```

_Options guide for common situations._

> The defaults are suitable for typical query use, as apps tend to have more queries than mutations.
>
> | Situation | `loadOnMount` | `loadOnReload` | `loadOnReset` | `reloadOnLoad` | `resetOnLoad` |
> | :-- | :-: | :-: | :-: | :-: | :-: |
> | Profile query | ✔️ | ✔️ | ✔️ |  |  |
> | Login mutation |  |  |  |  | ✔️ |
> | Logout mutation |  |  |  |  | ✔️ |
> | Change password mutation |  |  |  |  |  |
> | Change name mutation |  |  |  | ✔️ |  |
> | Like a post mutation |  |  |  | ✔️ |  |

---

### constant GraphQLContext

[React context object](https://reactjs.org/docs/context#api) for a [`GraphQL`](#class-graphql) instance.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `Provider` | Function | [React context provider component](https://reactjs.org/docs/context#contextprovider). |
| `Consumer` | Function | [React context consumer component](https://reactjs.org/docs/context#contextconsumer). |

#### See

- [`GraphQLProvider`](#function-graphqlprovider) is used to provide this context.
- [`useGraphQL`](#function-usegraphql) React hook requires an ancestor [`GraphQLContext`](#constant-graphqlcontext) `Provider` to work.

#### Examples

_A button component that resets the [GraphQL cache](#graphql-instance-property-cache)._

> ```jsx
> import React from 'react'
> import { GraphQLContext } from 'graphql-react'
>
> const ResetCacheButton = () => {
>   const graphql = React.useContext(GraphQLContext)
>   return <button onClick={graphql.reset}>Reset cache</button>
> }
> ```

---

### type GraphQLCache

A [GraphQL cache](#graphql-instance-property-cache) map of GraphQL operation results.

**Type:** object&lt;[GraphQLCacheKey](#type-graphqlcachekey), [GraphQLCacheValue](#type-graphqlcachevalue)>

#### See

- [`GraphQL`](#class-graphql) constructor accepts this type in `options.cache`.
- [`GraphQL` instance property `cache`](#graphql-instance-property-cache) is this type.

---

### type GraphQLCacheKey

A [GraphQL cache](#type-graphqlcache) key, derived from a hash of the [`fetch` options](#type-graphqlfetchoptions) of the GraphQL operation that populated the [value](#type-graphqlcachevalue).

**Type:** string

---

### type GraphQLCacheValue

JSON serializable GraphQL operation result that includes errors and data.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `fetchError` | string? | `fetch` error message. |
| `httpError` | [HttpError](#type-httperror)? | `fetch` response HTTP error. |
| `parseError` | string? | Parse error message. |
| `graphQLErrors` | Array&lt;object>? | GraphQL response errors. |
| `data` | object? | GraphQL response data. |

---

### type GraphQLFetchOptions

GraphQL API URL and [polyfillable `fetch` options](https://github.github.io/fetch/#options). The `url` property gets extracted and the rest are used as [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.

**Type:** object

| Property      | Type               | Description                      |
| :------------ | :----------------- | :------------------------------- |
| `url`         | string             | GraphQL API URL.                 |
| `body`        | string \| FormData | HTTP request body.               |
| `headers`     | object             | HTTP request headers.            |
| `credentials` | string?            | Authentication credentials mode. |

#### See

- [`GraphQLFetchOptionsOverride` functions](#type-graphqlfetchoptionsoverride) accept this type.

---

### type GraphQLFetchOptionsOverride

Overrides default [GraphQL `fetch` options](#type-graphqlfetchoptions). Mutate the provided options object; there is no need to return it.

**Type:** Function

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | [GraphQLFetchOptions](#type-graphqlfetchoptions) | [GraphQL `fetch` options](#type-graphqlfetchoptions) tailored to the [GraphQL operation](#type-graphqloperation), e.g. if there are files to upload `options.body` will be a [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instance conforming to the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec). |

#### See

- [`GraphQL` instance method `operate`](#graphql-instance-method-operate) accepts this type in `options.fetchOptionsOverride`.
- [`useGraphQL`](#function-usegraphql) React hook accepts this type in `options.fetchOptionsOverride`.

#### Examples

_Setting [GraphQL `fetch` options](#type-graphqlfetchoptions) for an imaginary API._

> ```js
> options => {
>   options.url = 'https://api.example.com/graphql'
>   options.credentials = 'include'
> }
> ```

---

### type GraphQLOperation

A GraphQL operation. Additional properties may be used; all are sent to the GraphQL server.

**Type:** object

| Property    | Type   | Description                    |
| :---------- | :----- | :----------------------------- |
| `query`     | string | GraphQL queries/mutations.     |
| `variables` | object | Variables used in the `query`. |

#### See

- [`GraphQL` instance method `operate`](#graphql-instance-method-operate) accepts this type in `options.operation`.
- [`useGraphQL`](#function-usegraphql) React hook accepts this type in `options.operation`.

---

### type GraphQLOperationLoading

A loading GraphQL operation.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey). |
| `cacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue)? | [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue) from the last identical query. |
| `cacheValuePromise` | Promise&lt;[GraphQLCacheValue](#type-graphqlcachevalue)> | Resolves the loaded [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). |

#### See

- [`GraphQL` instance method `operate`](#graphql-instance-method-operate) returns this type.

---

### type GraphQLOperationStatus

The status of a GraphQL operation.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `load` | Function | Loads the GraphQL operation on demand, updating the [GraphQL cache](#graphql-instance-property-cache). |
| `loading` | boolean | Is the GraphQL operation loading. |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey). |
| `cacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue) | [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). |

#### See

- [`useGraphQL`](#function-usegraphql) React hook returns this type.

---

### type HttpError

[`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) HTTP error.

**Type:** object

| Property     | Type   | Description       |
| :----------- | :----- | :---------------- |
| `status`     | number | HTTP status code. |
| `statusText` | string | HTTP status text. |

---

### type ReactNode

A React virtual DOM node; anything that can be rendered.

**Type:** undefined | null | boolean | number | string | React.Element | Array&lt;[ReactNode](#type-reactnode)>
