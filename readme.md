![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

[![npm version](https://badgen.net/npm/v/graphql-react)](https://npm.im/graphql-react) [![CI status](https://github.com/jaydenseric/graphql-react/workflows/CI/badge.svg)](https://github.com/jaydenseric/graphql-react/actions)

A [GraphQL](https://graphql.org) client for [React](https://reactjs.org) using modern [context](https://reactjs.org/docs/context) and [hooks](https://reactjs.org/docs/hooks-intro) APIs that is lightweight (&lt; 3.5 KB [size limited](https://github.com/ai/size-limit)) but powerful; the first [Relay](https://facebook.github.io/relay) and [Apollo](https://apollographql.com/docs/react) alternative with server side rendering.

- [Setup](#setup)
- [Usage](#usage)
- [Examples](#examples)
- [Support](#support)
- [API](#api)
- [Apollo comparison](#apollo-comparison)

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

Use the [`useGraphQL`](#function-usegraphql) React hook in your components to make queries and mutations, or use the [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) directly.

## Examples

- [The official Next.js example](https://github.com/vercel/next.js/tree/canary/examples/with-graphql-react).
- [The Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

Here is a basic example using the [GitHub GraphQL API](https://docs.github.com/en/graphql), with tips commented:

```jsx
import { GraphQL, GraphQLProvider, useGraphQL } from 'graphql-react';
import React from 'react';

// Any GraphQL API can be queried in components, where fetch options for the
// URI, auth headers, etc. can be specified. The `useGraphQL` hook will do less
// work for following renders if `fetchOptionsOverride` is defined outside the
// component, or is memoized using the `React.useMemo` hook within the
// component. Typically it’s exported in a config module for use throughout the
// project. The default fetch options received by the override function are
// tailored to the operation; usually the body is JSON but if there are files in
// the variables it will be a `FormData` instance for a GraphQL multipart
// request.
function fetchOptionsOverride(options) {
  options.url = 'https://api.github.com/graphql';
  options.headers.Authorization = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
}

// The query is just a string; no need to use `gql` from `graphql-tag`. The
// special comment before the string allows editor syntax highlighting, Prettier
// formatting and linting. The cache system doesn’t require `__typename` or `id`
// fields to be queried.
const query = /* GraphQL */ `
  query($repoId: ID!) {
    repo: node(id: $repoId) {
      ... on Repository {
        stargazers {
          totalCount
        }
      }
    }
  }
`;

function RepoStarCount({ repoId }) {
  // Memoization allows the `useGraphQL` hook to avoid work in following renders
  // with the same GraphQL operation.
  const operation = React.useMemo(
    () => ({
      query,
      variables: {
        repoId,
      },
    }),
    [repoId]
  );

  // The `useGraphQL` hook can be used for both queries and mutations.
  const { loading, cacheValue } = useGraphQL({
    operation,
    fetchOptionsOverride,

    // Load the query whenever the component mounts. This is desirable for
    // queries to display content, but not for on demand situations like
    // pagination view more buttons or forms that submit mutations.
    loadOnMount: true,

    // Reload the query whenever a global cache reload is signaled.
    loadOnReload: true,

    // Reload the query whenever the global cache is reset. Resets immediately
    // delete the cache and are mostly only used when logging out the user.
    loadOnReset: true,
  });

  return cacheValue?.data
    ? cacheValue.data.repo.stargazers.totalCount
    : loading
    ? // Data is often reloaded, so don’t assume loading indicates no data.
      'Loading…'
    : // Detailed error info is available in the `cacheValue` properties
      // `fetchError`, `httpError`, `parseError` and `graphQLErrors`. A
      // combination of errors is possible, and an error doesn’t necessarily
      // mean data is unavailable.
      'Error!';
}

// Zero config GraphQL client that manages the cache.
const graphql = new GraphQL();

const App = () => (
  <GraphQLProvider graphql={graphql}>
    <RepoStarCount repoId="MDEwOlJlcG9zaXRvcnkxMTk5Mzg5Mzk=" />
  </GraphQLProvider>
);
```

## Support

- Node.js `^10.17.0 || ^12.0.0 || >= 13.7.0`
- Browsers [`> 0.5%, not OperaMini all, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+OperaMini+all%2C+not+dead)

Consider polyfilling:

- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)

## API

### Table of contents

- [class GraphQL](#class-graphql)
  - [GraphQL instance method off](#graphql-instance-method-off)
  - [GraphQL instance method on](#graphql-instance-method-on)
  - [GraphQL instance method operate](#graphql-instance-method-operate)
  - [GraphQL instance method reload](#graphql-instance-method-reload)
  - [GraphQL instance method reset](#graphql-instance-method-reset)
  - [GraphQL instance property cache](#graphql-instance-property-cache)
  - [GraphQL instance property operations](#graphql-instance-property-operations)
  - [GraphQL event cache](#graphql-event-cache)
  - [GraphQL event fetch](#graphql-event-fetch)
  - [GraphQL event reload](#graphql-event-reload)
  - [GraphQL event reset](#graphql-event-reset)
- [function GraphQLProvider](#function-graphqlprovider)
- [function hashObject](#function-hashobject)
- [function reportCacheErrors](#function-reportcacheerrors)
- [function ssr](#function-ssr)
- [function useGraphQL](#function-usegraphql)
- [constant GraphQLContext](#constant-graphqlcontext)
- [type GraphQLCache](#type-graphqlcache)
- [type GraphQLCacheKey](#type-graphqlcachekey)
- [type GraphQLCacheKeyCreator](#type-graphqlcachekeycreator)
- [type GraphQLCacheValue](#type-graphqlcachevalue)
- [type GraphQLFetchOptions](#type-graphqlfetchoptions)
- [type GraphQLFetchOptionsOverride](#type-graphqlfetchoptionsoverride)
- [type GraphQLOperation](#type-graphqloperation)
- [type GraphQLOperationLoading](#type-graphqloperationloading)
- [type GraphQLOperationStatus](#type-graphqloperationstatus)
- [type HttpError](#type-httperror)
- [type ReactNode](#type-reactnode)

### class GraphQL

A lightweight GraphQL client that caches queries and mutations.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object? = {} | Options. |
| `options.cache` | [GraphQLCache](#type-graphqlcache)? = {} | Cache to import; usually from a server side render. |

#### See

- [`reportCacheErrors`](#function-reportcacheerrors) to setup error reporting.

#### Examples

_Ways to `import`._

> ```js
> import { GraphQL } from 'graphql-react';
> ```
>
> ```js
> import GraphQL from 'graphql-react/universal/GraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { GraphQL } = require('graphql-react');
> ```
>
> ```js
> const GraphQL = require('graphql-react/universal/GraphQL');
> ```

_Construct a GraphQL client._

> ```js
> import { GraphQL } from 'graphql-react';
>
> const graphql = new GraphQL();
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
| `options.cacheKeyCreator` | [GraphQLCacheKeyCreator](#type-graphqlcachekeycreator)? = [hashObject](#function-hashobject) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) creator for the operation. |
| `options.reloadOnLoad` | boolean? = `false` | Should a [GraphQL reload](#graphql-instance-method-reload) happen after the operation loads, excluding the loaded operation cache. |
| `options.resetOnLoad` | boolean? = `false` | Should a [GraphQL reset](#graphql-instance-method-reset) happen after the operation loads, excluding the loaded operation cache. |

**Returns:** [GraphQLOperationLoading](#type-graphqloperationloading) — Loading GraphQL operation details.

##### Fires

- [GraphQL event fetch](#graphql-event-fetch)
- [GraphQL event cache](#graphql-event-cache)

#### GraphQL instance method reload

Signals that [GraphQL cache](#graphql-instance-property-cache) subscribers such as the [`useGraphQL`](#function-usegraphql) React hook should reload their GraphQL operation.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | A [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache to exempt from reloading. |

##### Fires

- [GraphQL event reload](#graphql-event-reload)

##### Examples

_Reloading the [GraphQL cache](#graphql-instance-property-cache)._

> ```js
> graphql.reload();
> ```

#### GraphQL instance method reset

Resets the [GraphQL cache](#graphql-instance-property-cache), useful when a user logs out.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | A [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache to exempt from deletion. Useful for resetting cache after a mutation, preserving the mutation cache. |

##### Fires

- [GraphQL event reset](#graphql-event-reset)

##### Examples

_Resetting the [GraphQL cache](#graphql-instance-property-cache)._

> ```js
> graphql.reset();
> ```

#### GraphQL instance property cache

Cache of loaded GraphQL operations. You probably don’t need to interact with this unless you’re implementing a server side rendering framework.

**Type:** [GraphQLCache](#type-graphqlcache)

##### Examples

_Export cache as JSON._

> ```js
> const exportedCache = JSON.stringify(graphql.cache);
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

#### GraphQL event cache

Signals that a [GraphQL operation](#type-graphqloperation) was fetched and cached.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | The [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for the operation that was cached. |
| `cacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue) | The loaded [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). |
| `response` | Response? | The [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance; may be undefined if there was a fetch error. |

#### GraphQL event fetch

Signals that a [GraphQL operation](#type-graphqloperation) is being fetched.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | The [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for the operation being fetched. |
| `cacheValuePromise` | Promise&lt;[GraphQLCacheValue](#type-graphqlcachevalue)> | Resolves the loaded [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). |

#### GraphQL event reload

Signals that [GraphQL cache](#graphql-instance-property-cache) subscribers such as the [`useGraphQL`](#function-usegraphql) React hook should reload their GraphQL operation.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | A [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache to exempt from reloading. |

#### GraphQL event reset

Signals that the [GraphQL cache](#graphql-instance-property-cache) has been reset.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `exceptCacheKey` | [GraphQLCacheKey](#type-graphqlcachekey)? | The [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for cache that was exempted from deletion. |

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

_Ways to `import`._

> ```js
> import { GraphQLProvider } from 'graphql-react';
> ```
>
> ```js
> import GraphQLProvider from 'graphql-react/universal/GraphQLProvider.js';
> ```

_Ways to `require`._

> ```js
> const { GraphQLProvider } = require('graphql-react');
> ```
>
> ```js
> const GraphQLProvider = require('graphql-react/universal/GraphQLProvider');
> ```

_Provide a [`GraphQL`](#class-graphql) instance for an app._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react';
> import React from 'react';
>
> const graphql = new GraphQL();
>
> const App = ({ children }) => (
>   <GraphQLProvider graphql={graphql}>{children}</GraphQLProvider>
> );
> ```

---

### function hashObject

Hashes an object.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `object` | object | A JSON serializable object that may contain [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instances. |

**Returns:** string — A hash.

#### See

- [`GraphQLCacheKeyCreator` functions](#type-graphqlcachekeycreator) may use this to derive a [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey).
- [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) uses this as a default value for `options.cacheKeyCreator`.
- [`useGraphQL`](#function-usegraphql) React hook this uses this as a default value for `options.cacheKeyCreator`.

#### Examples

_Ways to `import`._

> ```js
> import { hashObject } from 'graphql-react';
> ```
>
> ```js
> import hashObject from 'graphql-react/universal/hashObject.js';
> ```

_Ways to `require`._

> ```js
> const { hashObject } = require('graphql-react');
> ```
>
> ```js
> const hashObject = require('graphql-react/universal/hashObject');
> ```

---

### function reportCacheErrors

A [`GraphQL`](#class-graphql) [`cache`](#graphql-event-cache) event handler that reports [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API), HTTP, parse and GraphQL errors via `console.log()`. In a browser environment the grouped error details are expandable.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `data` | [GraphQL#event:cache](#graphql-event-cache) | [`GraphQL`](#class-graphql) [`cache`](#graphql-event-cache) event data. |

#### Examples

_Ways to `import`._

> ```js
> import { reportCacheErrors } from 'graphql-react';
> ```
>
> ```js
> import reportCacheErrors from 'graphql-react/universal/reportCacheErrors.js';
> ```

_Ways to `require`._

> ```js
> const { reportCacheErrors } = require('graphql-react');
> ```
>
> ```js
> const reportCacheErrors = require('graphql-react/universal/reportCacheErrors');
> ```

_[`GraphQL`](#class-graphql) initialized to report cache errors._

> ```js
> import { GraphQL, reportCacheErrors } from 'graphql-react';
>
> const graphql = new GraphQL();
> graphql.on('cache', reportCacheErrors);
> ```

---

### function ssr

Asynchronously server side renders a [React node](#type-reactnode), preloading all GraphQL queries set to `loadOnMount`. After resolving, cache can be exported from the [`GraphQL`](#class-graphql) instance property [`cache`](#graphql-instance-property-cache) for serialization (usually to JSON) and transport to the client for hydration via the [`GraphQL`](#class-graphql) constructor parameter `options.cache`.

Be sure to globally polyfill [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API).

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `graphql` | [GraphQL](#class-graphql) | [`GraphQL`](#class-graphql) instance. |
| `node` | [ReactNode](#type-reactnode) | React virtual DOM node. |
| `render` | Function? = ReactDOMServer.renderToStaticMarkup | Synchronous React server side render function, defaulting to [`ReactDOMServer.renderToStaticMarkup`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) as it is more efficient than [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring). |

**Returns:** Promise&lt;string> — Promise resolving the rendered HTML string.

#### See

- [`ReactDOMServer` docs](https://reactjs.org/docs/react-dom-server).
- [`next-graphql-react`](https://npm.im/next-graphql-react) to use this API in a [Next.js](https://nextjs.org) project.

#### Examples

_Ways to `import`._

> ```js
> import { ssr } from 'graphql-react/server';
> ```
>
> ```js
> import ssr from 'graphql-react/server/GraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { ssr } = require('graphql-react/server');
> ```
>
> ```js
> const ssr = require('graphql-react/server/ssr');
> ```

_SSR function that resolves a HTML string and cache JSON for client hydration._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react';
> import { ssr } from 'graphql-react/server';
> import React from 'react';
> import ReactDOMServer from 'react-dom/server';
> import { App } from './components/App.mjs';
>
> async function render() {
>   const graphql = new GraphQL();
>   const page = (
>     <GraphQLProvider graphql={graphql}>
>       <App />
>     </GraphQLProvider>
>   );
>   const html = await ssr(graphql, page, ReactDOMServer.renderToString);
>   const cache = JSON.stringify(graphql.cache);
>   return { html, cache };
> }
> ```

_SSR function that resolves a HTML string suitable for a static page._

> ```jsx
> import { GraphQL, GraphQLProvider } from 'graphql-react';
> import { ssr } from 'graphql-react/server';
> import React from 'react';
> import { App } from './components/App.mjs';
>
> function render() {
>   const graphql = new GraphQL();
>   const page = (
>     <GraphQLProvider graphql={graphql}>
>       <App />
>     </GraphQLProvider>
>   );
>   return ssr(graphql, page);
> }
> ```

---

### function useGraphQL

A [React hook](https://reactjs.org/docs/hooks-intro) to manage a GraphQL operation in a component.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object | Options. |
| `options.operation` | [GraphQLOperation](#type-graphqloperation) | GraphQL operation. To reduce work for following renders, define it outside the component or memoize it using the [`React.useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) hook. |
| `options.fetchOptionsOverride` | [GraphQLFetchOptionsOverride](#type-graphqlfetchoptionsoverride)? | Overrides default [`fetch` options](#type-graphqlfetchoptions) for the [GraphQL operation](#type-graphqloperation). To reduce work for following renders, define it outside the component or memoize it using the [`React.useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) hook. |
| `options.cacheKeyCreator` | [GraphQLCacheKeyCreator](#type-graphqlcachekeycreator)? = [hashObject](#function-hashobject) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) creator for the operation. |
| `options.loadOnMount` | boolean? = `false` | Should the operation load when the component mounts. |
| `options.loadOnReload` | boolean? = `false` | Should the operation load when the [`GraphQL`](#class-graphql) [`reload`](#graphql-event-reload) event fires and there is a [GraphQL cache](#graphql-instance-property-cache) [value](#type-graphqlcachevalue) to reload, but only if the operation was not the one that caused the reload. |
| `options.loadOnReset` | boolean? = `false` | Should the operation load when the [`GraphQL`](#class-graphql) [`reset`](#graphql-event-reset) event fires and the [GraphQL cache](#graphql-instance-property-cache) [value](#type-graphqlcachevalue) is deleted, but only if the operation was not the one that caused the reset. |
| `options.reloadOnLoad` | boolean? = `false` | Should a [GraphQL reload](#graphql-instance-method-reload) happen after the operation loads, excluding the loaded operation cache. |
| `options.resetOnLoad` | boolean? = `false` | Should a [GraphQL reset](#graphql-instance-method-reset) happen after the operation loads, excluding the loaded operation cache. |

**Returns:** [GraphQLOperationStatus](#type-graphqloperationstatus) — GraphQL operation status.

#### See

- [`GraphQLContext`](#constant-graphqlcontext) is required for this hook to work.

#### Examples

_Ways to `import`._

> ```js
> import { useGraphQL } from 'graphql-react';
> ```
>
> ```js
> import useGraphQL from 'graphql-react/universal/useGraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { useGraphQL } = require('graphql-react');
> ```
>
> ```js
> const useGraphQL = require('graphql-react/universal/useGraphQL');
> ```

_Options guide for common situations._

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

_Ways to `import`._

> ```js
> import { GraphQLContext } from 'graphql-react';
> ```
>
> ```js
> import GraphQLContext from 'graphql-react/universal/GraphQLContext.js';
> ```

_Ways to `require`._

> ```js
> const { GraphQLContext } = require('graphql-react');
> ```
>
> ```js
> const GraphQLContext = require('graphql-react/universal/GraphQLContext');
> ```

_A button component that resets the [GraphQL cache](#graphql-instance-property-cache)._

> ```jsx
> import { GraphQLContext } from 'graphql-react';
> import React from 'react';
>
> const ResetCacheButton = () => {
>   const graphql = React.useContext(GraphQLContext);
>   return <button onClick={graphql.reset}>Reset cache</button>;
> };
> ```

---

### type GraphQLCache

A [GraphQL cache](#graphql-instance-property-cache) map of [GraphQL operation](#type-graphqloperation) results.

**Type:** object&lt;[GraphQLCacheKey](#type-graphqlcachekey), [GraphQLCacheValue](#type-graphqlcachevalue)>

#### See

- [`GraphQL`](#class-graphql) constructor accepts this type for `options.cache`.
- [`GraphQL`](#class-graphql) instance property [`cache`](#graphql-instance-property-cache) is this type.

---

### type GraphQLCacheKey

A [GraphQL cache](#type-graphqlcache) key to identify a [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). Typically created by a [GraphQL cache](#type-graphqlcache) key [creator](#type-graphqlcachekeycreator) that hashes the [`fetch` options](#type-graphqlfetchoptions) of the associated [GraphQL operation](#type-graphqloperation) using [`hashObject`](#function-hashobject).

**Type:** string

---

### type GraphQLCacheKeyCreator

[GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) creator for a [GraphQL operation](#type-graphqloperation). It can either use the provided [`fetch` options](#type-graphqlfetchoptions) (e.g. derive a hash), or simply return a hardcoded string.

**Type:** Function

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | [GraphQLFetchOptions](#type-graphqlfetchoptions) | [GraphQL `fetch` options](#type-graphqlfetchoptions) tailored to the [GraphQL operation](#type-graphqloperation), e.g. if there are files to upload `options.body` will be a [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instance conforming to the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec). |

#### See

- [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) accepts this type for `options.cacheKeyCreator`.
- [`useGraphQL`](#function-usegraphql) React hook accepts this type for `options.cacheKeyCreator`.

---

### type GraphQLCacheValue

JSON serializable [GraphQL operation](#type-graphqloperation) result that includes errors and data.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `fetchError` | string? | [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) error message. |
| `httpError` | [HttpError](#type-httperror)? | [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) HTTP error. |
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

- [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) accepts this type for `options.fetchOptionsOverride`.
- [`useGraphQL`](#function-usegraphql) React hook accepts this type for `options.fetchOptionsOverride`.

#### Examples

_Setting [GraphQL `fetch` options](#type-graphqlfetchoptions) for an imaginary API._

> ```js
> (options) => {
>   options.url = 'https://api.example.com/graphql';
>   options.credentials = 'include';
> };
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

- [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) accepts this type for `options.operation`.
- [`useGraphQL`](#function-usegraphql) React hook accepts this type for `options.operation`.

---

### type GraphQLOperationLoading

A loading [GraphQL operation](#type-graphqloperation).

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey). |
| `cacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue)? | [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue) from the last identical query. |
| `cacheValuePromise` | Promise&lt;[GraphQLCacheValue](#type-graphqlcachevalue)> | Resolves the loaded [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue). |

#### See

- [`GraphQL`](#class-graphql) instance method [`operate`](#graphql-instance-method-operate) returns this type.

---

### type GraphQLOperationStatus

The status of a [GraphQL operation](#type-graphqloperation) managed by the [`useGraphQL`](#function-usegraphql) React hook.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `load` | Function | Loads the current [GraphQL operation](#type-graphqloperation) on demand, updating the [GraphQL cache](#graphql-instance-property-cache). |
| `loading` | boolean | Is the current [GraphQL operation](#type-graphqloperation) loading. |
| `cacheKey` | [GraphQLCacheKey](#type-graphqlcachekey) | [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) for the current [GraphQL operation](#type-graphqloperation) and [GraphQL `fetch` options](#type-graphqlfetchoptions). |
| `cacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue) | [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue) for the current [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey). |
| `loadedCacheValue` | [GraphQLCacheValue](#type-graphqlcachevalue) | [GraphQL cache](#type-graphqlcache) [value](#type-graphqlcachevalue) that was last loaded by this [`useGraphQL`](#function-usegraphql) React hook; even if the [GraphQL cache](#graphql-instance-property-cache) [key](#type-graphqlcachekey) has since changed. |

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

**Type:** `undefined` | `null` | boolean | number | string | React.Element | Array&lt;[ReactNode](#type-reactnode)>

## Apollo comparison

### Bundle impact

#### graphql-react

A &lt; 3.5 KB bundle impact is guaranteed by [Size Limit](https://github.com/ai/size-limit) tests. The impact is smaller than the bundle size badge suggests as the internal [`object-assign`](https://npm.im/object-assign) dependency is shared with [`react`](https://npm.im/react).

| Dependency | Install size | Bundle size |
| --- | --- | --- |
| [`graphql-react`](https://npm.im/graphql-react) | [![graphql-react install size](https://badgen.net/packagephobia/install/graphql-react)](https://packagephobia.now.sh/result?p=graphql-react) | [![graphql-react minzipped size](https://badgen.net/bundlephobia/minzip/graphql-react)](https://bundlephobia.com/result?p=graphql-react) |

The bundle impact may be smaller, depending on how much of the API you use.

#### Apollo

Several dependencies must be installed for a minimal Apollo project.

| Dependency | Install size | Bundle size |
| --- | --- | --- |
| [`@apollo/client`](https://npm.im/@apollo/client) | [![@apollo/client install size](https://badgen.net/packagephobia/install/@apollo/client)](https://packagephobia.now.sh/result?p=@apollo/client) | [![@apollo/client minzipped size](https://badgen.net/bundlephobia/minzip/@apollo/client)](https://bundlephobia.com/result?p=@apollo/client) |
| [`graphql`](https://npm.im/graphql) | [![graphql install size](https://badgen.net/packagephobia/install/graphql)](https://packagephobia.now.sh/result?p=graphql) | [![graphql minzipped size](https://badgen.net/bundlephobia/minzip/graphql)](https://bundlephobia.com/result?p=graphql) |

[Tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers will eliminate unused [`graphql`](https://npm.im/graphql) exports.

Consuming the API multiple ways in a project or it’s dependencies causes _massive_ duplication in a bundle (doubling or tripling the bundle impact); see [**_ESM_**](#esm).

In addition, [`possibleTypes`](https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually) config impacts bundle size relative to the number and complexity of schema unions and interfaces; see [**_Cache strategy_**](#cache-strategy).

### ESM

#### graphql-react

Supports both CJS and [ESM in Node.js](https://nodejs.org/api/esm.html) whilst avoiding the [dual package hazard](https://nodejs.org/api/esm.html#esm_dual_package_hazard) and ensuring private internal code can’t be accessed from outside the package, via [`package.json` `exports` field conditional exports](https://nodejs.org/api/esm.html#esm_conditional_exports).

Individual parts of the public API exist in separate CJS `.js` files that can be accessed via:

- **Deep default imports** (recommended). Only what’s needed gets bundled, without relying on [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking).
- **Main index named imports**. [Webpack](https://webpack.js.org) v5+ can tree shake imports from the bare `graphql-react` specifier, while earlier versions and [Rollup](https://rollupjs.org) can only [tree shake](https://developer.mozilla.org/docs/Glossary/Tree_shaking) imports from `graphql-react/universal/index.mjs`.

Consuming the API multiple ways in a project or it’s dependencies doesn’t cause duplication in a bundle.

#### Apollo

Faux ESM that can’t be used by Node.js (files don't have the `.mjs` extension and import specifiers don't contain file extensions) is provided via a package `module` field for [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers like [webpack](https://webpack.js.org) and [Rollup](https://rollupjs.org).

Arbitrary CJS bundles are available at the main index and specific deep paths.

Consuming the API multiple ways in a project or it’s dependencies causes _massive_ duplication in a bundle. This can easily double or triple the bundle impact.

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
`;
```

The optional `/* GraphQL */` comment signals the syntax for highlighters and linters.

#### Apollo

Uses template strings tagged with `gql`, re-exported from [`graphql-tag`](https://npm.im/graphql-tag):

```js
import { gql } from '@apollo/client';

const QUERY = gql`
  {
    viewer {
      id
    }
  }
`;
```

This complexity impacts bundle size and runtime performance. [`babel-plugin-graphql-tag`](https://npm.im/babel-plugin-graphql-tag) can be used to process the queries at build time, but this replaces the original strings with larger objects.

### Cache strategy

#### graphql-react

The [`GraphQL`](#class-graphql) client has no GraphQL API specific config; [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options are determined on demand at the component level. Multiple GraphQL APIs can be queried!

GraphQL operations are cached under hashes of their [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options. Multiple operations with the same hash share the same loading status and cache value.

[`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API), HTTP, parse and GraphQL errors can be cached, and therefore server side rendered and transported to the client for hydration and initial render.

#### Apollo

Apollo Client is configured for one GraphQL API per app.

GraphQL operation data is deconstructed based upon `id` and `__typename` fields into a “[normalized](https://apollographql.com/docs/react/caching/cache-configuration/#data-normalization)” cache. These fields must be queried even if they aren’t used in components.

[Errors aren’t cached](https://github.com/apollographql/apollo-client/issues/3897#issuecomment-432982170), and therefore can’t be server side rendered and transported to the client for hydration and initial render.

To cache fragments on unions and interfaces properly, Apollo Client must be configured with schema knowledge extracted at build time, via [`possibleTypes`](https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually). It’s challenging to reconfigure and redeploy clients whenever the GraphQL schema updates. Also, the config increases the client bundle size; see [**_Bundle impact_**](#bundle-impact).

### Stale cache

#### graphql-react

Typically, cache is refreshed for mounting components.

GraphQL operations can optionally refresh all cache except their own fresh cache; handy for mutations.

#### Apollo

Typically, cache isn’t refreshed for mounting components.

GraphQL mutations only update the cache with the contents of their payload. The prescribed approach is to try to manually update other normalized cache after mutations using complicated and often buggy APIs. Resetting all cache is possible, but it also wipes the result of the last operation.

### File uploads

#### graphql-react

Supports file uploads out of the box, compliant with the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec) (authored by [@jaydenseric](https://github.com/jaydenseric)) which is [supported by popular GraphQL servers](https://github.com/jaydenseric/graphql-multipart-request-spec#implementations) including [Apollo Server](https://apollographql.com/docs/apollo-server). [File input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) values and more can be used as query or mutation arguments.

#### Apollo

Supports file uploads if you manually setup Apollo Client with [`apollo-upload-client`](https://npm.im/apollo-upload-client) (also by [@jaydenseric](https://github.com/jaydenseric)).

### Subscriptions

#### graphql-react

Not supported yet, see [#15](https://github.com/jaydenseric/graphql-react/issues/15).

#### Apollo

Supported.

### TypeScript

#### graphql-react

Written in ECMAScript; no types are exported. Type definitions are available via [`@types/graphql-react`](https://npm.im/@types/graphql-react).

#### Apollo

Written in TypeScript; types are exported.

### Next.js integration

#### graphql-react

Has [an official example](https://github.com/vercel/next.js/tree/canary/examples/with-graphql-react) using [`next-graphql-react`](https://npm.im/next-graphql-react), which is an easily installed integration to enable server side rendered GraphQL queries.

Also has [more detailed examples](https://github.com/jaydenseric/graphql-react-examples), deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

#### Apollo

Has [an official example](https://github.com/vercel/next.js/tree/canary/examples/with-apollo) with boilerplate code to manually copy. It’s difficult to stay up to date with [the frequent changes](https://github.com/vercel/next.js/commits/canary/examples/with-apollo).
