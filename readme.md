![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

[![npm version](https://badgen.net/npm/v/graphql-react)](https://npm.im/graphql-react) [![CI status](https://github.com/jaydenseric/graphql-react/workflows/CI/badge.svg)](https://github.com/jaydenseric/graphql-react/actions)

A [GraphQL](https://graphql.org) client for [React](https://reactjs.org) using modern [context](https://reactjs.org/docs/context) and [hooks](https://reactjs.org/docs/hooks-intro) APIs that’s lightweight (< 3.5 KB) but powerful; the first [Relay](https://relay.dev) and [Apollo](https://apollographql.com/apollo-client) alternative with server side rendering.

The [API](#api) can also be used to custom load, cache and server side render any data, even from non GraphQL sources.

- [Setup](#setup)
- [Examples](#examples)
- [Support](#support)
- [API](#api)

## Setup

First, polyfill any required globals (see [_**Support**_](#support)) that are missing in your server and client environments.

### Next.js setup

See the [`next-graphql-react`](https://npm.im/next-graphql-react) setup instructions.

### Custom React setup

To install [`graphql-react`](https://npm.im/graphql-react) from [npm](https://npmjs.com) run:

```sh
npm install graphql-react
```

Create a single [`Cache`](#class-cache) instance and use the [`Provider`](#function-dataprovider) component to provide it for your app.

To server side render your app, use the [`waterfallRender`](https://github.com/jaydenseric/react-waterfall-render#function-waterfallrender) function from [`react-waterfall-render`](https://npm.im/react-waterfall-render).

## Examples

- [Official Next.js example](https://github.com/vercel/next.js/tree/canary/examples/with-graphql-react).
- [Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.vercel.app](https://graphql-react.vercel.app).

Here is a basic example using the [GitHub GraphQL API](https://docs.github.com/en/graphql), with tips commented:

```jsx
// While named imports are available, deep imports result in a small bundle size
// regardless of the (often dubious) tree-shaking abilities of your bundler.
import useAutoLoad from 'graphql-react/public/useAutoLoad.js';
import useCacheEntry from 'graphql-react/public/useCacheEntry.js';
import useLoadGraphQL from 'graphql-react/public/useLoadGraphQL.js';
import useWaterfallLoad from 'graphql-react/public/useWaterfallLoad.js';
import { useCallback } from 'react';

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

export default function GitHubRepoStars({ repoId }) {
  const cacheKey = `GitHubRepoStars-${repoId}`;
  const cacheValue = useCacheEntry(cacheKey);

  // A hook for loading GraphQL is available, but custom hooks for loading non
  // GraphQL (e.g. fetching from a REST API) can be made.
  const loadGraphQL = useLoadGraphQL();

  const load = useCallback(
    () =>
      // To be DRY, utilize a custom hook for each API your app loads from, e.g.
      // `useLoadGraphQLGitHub`.
      loadGraphQL(
        cacheKey,
        // Fetch URI.
        'https://api.github.com/graphql',
        // Fetch options.
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            query,
            variables: {
              repoId,
            },
          }),
        }
      ),
    [cacheKey, loadGraphQL, repoId]
  );

  // This hook automatically keeps the cache entry loaded from when the
  // component mounts, reloading it if it’s staled or deleted. It also aborts
  // loading if the arguments change or the component unmounts; very handy for
  // auto-suggest components!
  useAutoLoad(cacheKey, load);

  // Waterfall loading can be used to load data when server side rendering,
  // enabled automagically by `next-graphql-react`. To learn how this works or
  // to set it up for a non Next.js app, see:
  // https://github.com/jaydenseric/react-waterfall-render
  const isWaterfallLoading = useWaterfallLoad(cacheKey, load);

  // When waterfall loading it’s efficient to skip rendering, as the app will
  // re-render once this step of the waterfall has loaded. If more waterfall
  // loading happens in children, those steps of the waterfall are awaited and
  // the app re-renders again, and so forth until there’s no more loading for
  // the final server side render.
  return isWaterfallLoading
    ? null
    : cacheValue
    ? cacheValue.errors
      ? // Unlike many other GraphQL libraries, detailed loading errors are
        // cached and can be server side rendered without causing a
        // server/client HTML mismatch error.
        'Error!'
      : cacheValue.data.repo.stargazers.totalCount
    : // In this situation no cache value implies loading. Use the
      // `useLoadingEntry` hook to manage loading in detail.
      'Loading…';
}
```

## Support

- [Node.js](https://nodejs.org): `^12.20 || >= 14.13`
- [Browsers](https://npm.im/browserslist): `> 0.5%, not OperaMini all, not IE > 0, not dead`

Consider polyfilling:

- [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/Window/performance)

## API

### Table of contents

- [class Cache](#class-cache)
  - [Cache instance property store](#cache-instance-property-store)
  - [Cache event delete](#cache-event-delete)
  - [Cache event prune](#cache-event-prune)
  - [Cache event set](#cache-event-set)
  - [Cache event stale](#cache-event-stale)
- [class Loading](#class-loading)
  - [Loading instance property store](#loading-instance-property-store)
  - [Loading event end](#loading-event-end)
  - [Loading event start](#loading-event-start)
- [class LoadingCacheValue](#class-loadingcachevalue)
  - [LoadingCacheValue instance property abortController](#loadingcachevalue-instance-property-abortcontroller)
  - [LoadingCacheValue instance property promise](#loadingcachevalue-instance-property-promise)
  - [LoadingCacheValue instance property timeStamp](#loadingcachevalue-instance-property-timestamp)
- [function cacheDelete](#function-cachedelete)
- [function cacheEntryDelete](#function-cacheentrydelete)
- [function cacheEntryPrune](#function-cacheentryprune)
- [function cacheEntrySet](#function-cacheentryset)
- [function cacheEntryStale](#function-cacheentrystale)
- [function cachePrune](#function-cacheprune)
- [function cacheStale](#function-cachestale)
- [function fetchGraphQL](#function-fetchgraphql)
- [function fetchOptionsGraphQL](#function-fetchoptionsgraphql)
- [function Provider](#function-provider)
- [function useAutoAbortLoad](#function-useautoabortload)
- [function useAutoLoad](#function-useautoload)
- [function useCache](#function-usecache)
- [function useCacheEntry](#function-usecacheentry)
- [function useCacheEntryPrunePrevention](#function-usecacheentrypruneprevention)
- [function useLoadGraphQL](#function-useloadgraphql)
- [function useLoading](#function-useloading)
- [function useLoadingEntry](#function-useloadingentry)
- [function useLoadOnDelete](#function-useloadondelete)
- [function useLoadOnMount](#function-useloadonmount)
- [function useLoadOnStale](#function-useloadonstale)
- [function useWaterfallLoad](#function-usewaterfallload)
- [member CacheContext](#member-cachecontext)
- [member HydrationTimeStampContext](#member-hydrationtimestampcontext)
- [member LoadingContext](#member-loadingcontext)
- [constant HYDRATION_TIME_MS](#constant-hydration_time_ms)
- [type CacheKey](#type-cachekey)
- [type CacheKeyMatcher](#type-cachekeymatcher)
- [type CacheValue](#type-cachevalue)
- [type FetchOptions](#type-fetchoptions)
- [type GraphQLOperation](#type-graphqloperation)
- [type GraphQLResult](#type-graphqlresult)
- [type GraphQLResultError](#type-graphqlresulterror)
- [type HighResTimeStamp](#type-highrestimestamp)
- [type Loader](#type-loader)
- [type LoadGraphQL](#type-loadgraphql)
- [type ReactNode](#type-reactnode)

### class Cache

Cache store.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `store` | object? = {} | Initial [cache store](#cache-instance-property-store). Useful for hydrating cache data from a server side render prior to the initial client side render. |

#### Examples

_Ways to `import`._

> ```js
> import { Cache } from 'graphql-react';
> ```
>
> ```js
> import Cache from 'graphql-react/public/Cache.js';
> ```

_Ways to `require`._

> ```js
> const { Cache } = require('graphql-react');
> ```
>
> ```js
> const Cache = require('graphql-react/public/Cache.js');
> ```

_Construct a new instance._

> ```js
> const cache = new Cache();
> ```

#### Cache instance property store

Store of cache [keys](#type-cachekey) and [values](#type-cachevalue).

**Type:** object

#### Cache event delete

Signals that a [cache store](#cache-instance-property-store) entry was deleted. The event name starts with the [cache key](#type-cachekey) of the deleted entry, followed by `/delete`.

**Type:** CustomEvent

#### Cache event prune

Signals that a [cache store](#cache-instance-property-store) entry will be deleted unless the event is canceled via `event.preventDefault()`. The event name starts with the [cache key](#type-cachekey) of the entry being pruned, followed by `/prune`.

**Type:** CustomEvent

#### Cache event set

Signals that a [cache store](#cache-instance-property-store) entry was set. The event name starts with the [cache key](#type-cachekey) of the set entry, followed by `/set`.

**Type:** CustomEvent

| Property | Type | Description |
| :-- | :-- | :-- |
| `detail` | object | Event detail. |
| `detail.cacheValue` | [CacheValue](#type-cachevalue) | Cache value that was set. |

#### Cache event stale

Signals that a [cache store](#cache-instance-property-store) entry is now stale (often due to a mutation) and should probably be reloaded. The event name starts with the [cache key](#type-cachekey) of the stale entry, followed by `/stale`.

**Type:** CustomEvent

---

### class Loading

Loading store.

#### Examples

_Ways to `import`._

> ```js
> import { Loading } from 'graphql-react';
> ```
>
> ```js
> import Loading from 'graphql-react/public/Loading.js';
> ```

_Ways to `require`._

> ```js
> const { Loading } = require('graphql-react');
> ```
>
> ```js
> const Loading = require('graphql-react/public/Loading.js');
> ```

_Construct a new instance._

> ```js
> const loading = new Loading();
> ```

#### Loading instance property store

Loading store, keyed by [cache key](#type-cachekey). Multiple [loading cache values](#class-loadingcachevalue) for the same key are set in the order they started.

**Type:** object<[CacheKey](#type-cachekey), Set<[LoadingCacheValue](#class-loadingcachevalue)>>

#### Loading event end

Signals the end of [loading a cache value](#class-loadingcachevalue); either the loading finished and the [cache value](#type-cachevalue) was set, the loading was aborted, or there was an error. The event name starts with the [cache key](#type-cachekey), followed by `/end`.

**Type:** CustomEvent

| Property | Type | Description |
| :-- | :-- | :-- |
| `detail` | object | Event detail. |
| `detail.loadingCacheValue` | [LoadingCacheValue](#class-loadingcachevalue) | Loading cache value that ended. |

#### Loading event start

Signals the start of [loading a cache value](#class-loadingcachevalue). The event name starts with the [cache key](#type-cachekey), followed by `/start`.

**Type:** CustomEvent

| Property | Type | Description |
| :-- | :-- | :-- |
| `detail` | object | Event detail. |
| `detail.loadingCacheValue` | [LoadingCacheValue](#class-loadingcachevalue) | Loading cache value that started. |

---

### class LoadingCacheValue

Controls a loading [cache value](#type-cachevalue).

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `loading` | [Loading](#class-loading) | Loading to update. |
| `cache` | [Cache](#class-cache) | Cache to update. |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `loadingResult` | Promise<[CacheValue](#type-cachevalue)> | Resolves the loading result (including any loading errors) to be set as the [cache value](#type-cachevalue) if loading isn’t aborted. Shouldn’t reject. |
| `abortController` | AbortController | Aborts this loading and skips setting the loading result as the [cache value](#type-cachevalue). Has no affect after loading ends. |

#### Fires

- [Loading event start](#loading-event-start)
- [Cache event set](#cache-event-set)
- [Loading event end](#loading-event-end)

#### Examples

_Ways to `import`._

> ```js
> import { LoadingCacheValue } from 'graphql-react';
> ```
>
> ```js
> import LoadingCacheValue from 'graphql-react/public/LoadingCacheValue.js';
> ```

_Ways to `require`._

> ```js
> const { LoadingCacheValue } = require('graphql-react');
> ```
>
> ```js
> const LoadingCacheValue = require('graphql-react/public/LoadingCacheValue.js');
> ```

#### LoadingCacheValue instance property abortController

Aborts this loading and skips setting the loading result as the [cache value](#type-cachevalue). Has no affect after loading ends.

**Type:** AbortController

#### LoadingCacheValue instance property promise

Resolves the loading result, after the [cache value](#type-cachevalue) has been set if the loading wasn’t aborted. Shouldn’t reject.

**Type:** Promise<\*>

#### LoadingCacheValue instance property timeStamp

When this loading started.

**Type:** [HighResTimeStamp](#type-highrestimestamp)

---

### function cacheDelete

Deletes [cache](#cache-instance-property-store) entries. Useful after a user logs out.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cache` | [Cache](#class-cache) | Cache to update. |
| `cacheKeyMatcher` | [CacheKeyMatcher](#type-cachekeymatcher)? | Matches [cache keys](#type-cachekey) to delete. By default all are matched. |

#### Fires

- [Cache event delete](#cache-event-delete)

#### Examples

_Ways to `import`._

> ```js
> import { cacheDelete } from 'graphql-react';
> ```
>
> ```js
> import cacheDelete from 'graphql-react/public/cacheDelete.js';
> ```

_Ways to `require`._

> ```js
> const { cacheDelete } = require('graphql-react');
> ```
>
> ```js
> const cacheDelete = require('graphql-react/public/cacheDelete.js');
> ```

---

### function cacheEntryDelete

Deletes a [cache](#cache-instance-property-store) entry.

| Parameter  | Type                       | Description      |
| :--------- | :------------------------- | :--------------- |
| `cache`    | [Cache](#class-cache)      | Cache to update. |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.       |

#### Fires

- [Cache event delete](#cache-event-delete)

#### Examples

_Ways to `import`._

> ```js
> import { cacheEntryDelete } from 'graphql-react';
> ```
>
> ```js
> import cacheEntryDelete from 'graphql-react/public/cacheEntryDelete.js';
> ```

_Ways to `require`._

> ```js
> const { cacheEntryDelete } = require('graphql-react');
> ```
>
> ```js
> const cacheEntryDelete = require('graphql-react/public/cacheEntryDelete.js');
> ```

---

### function cacheEntryPrune

Prunes a [cache](#cache-instance-property-store) entry, if no [prune event](#cache-event-prune) listener cancels the [cache](#cache-instance-property-store) entry deletion via `event.preventDefault()`.

| Parameter  | Type                       | Description      |
| :--------- | :------------------------- | :--------------- |
| `cache`    | [Cache](#class-cache)      | Cache to update. |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.       |

#### Fires

- [Cache event prune](#cache-event-prune)
- [Cache event delete](#cache-event-delete)

#### Examples

_Ways to `import`._

> ```js
> import { cacheEntryPrune } from 'graphql-react';
> ```
>
> ```js
> import cacheEntryPrune from 'graphql-react/public/cacheEntryPrune.js';
> ```

_Ways to `require`._

> ```js
> const { cacheEntryPrune } = require('graphql-react');
> ```
>
> ```js
> const cacheEntryPrune = require('graphql-react/public/cacheEntryPrune.js');
> ```

---

### function cacheEntrySet

Sets a [cache](#cache-instance-property-store) entry.

| Parameter    | Type                           | Description      |
| :----------- | :----------------------------- | :--------------- |
| `cache`      | [Cache](#class-cache)          | Cache to update. |
| `cacheKey`   | [CacheKey](#type-cachekey)     | Cache key.       |
| `cacheValue` | [CacheValue](#type-cachevalue) | Cache value.     |

#### Fires

- [Cache event set](#cache-event-set)

#### Examples

_Ways to `import`._

> ```js
> import { cacheEntrySet } from 'graphql-react';
> ```
>
> ```js
> import cacheEntrySet from 'graphql-react/public/cacheEntrySet.js';
> ```

_Ways to `require`._

> ```js
> const { cacheEntrySet } = require('graphql-react');
> ```
>
> ```js
> const cacheEntrySet = require('graphql-react/public/cacheEntrySet.js');
> ```

---

### function cacheEntryStale

Stales a [cache](#cache-instance-property-store) entry, signalling it should probably be reloaded.

| Parameter  | Type                       | Description      |
| :--------- | :------------------------- | :--------------- |
| `cache`    | [Cache](#class-cache)      | Cache to update. |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.       |

#### Fires

- [Cache event stale](#cache-event-stale)

#### Examples

_Ways to `import`._

> ```js
> import { cacheEntryStale } from 'graphql-react';
> ```
>
> ```js
> import cacheEntryStale from 'graphql-react/public/cacheEntryStale.js';
> ```

_Ways to `require`._

> ```js
> const { cacheEntryStale } = require('graphql-react');
> ```
>
> ```js
> const cacheEntryStale = require('graphql-react/public/cacheEntryStale.js');
> ```

---

### function cachePrune

Prunes [cache](#cache-instance-property-store) entries. Useful after a mutation.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cache` | [Cache](#class-cache) | Cache to update. |
| `cacheKeyMatcher` | [CacheKeyMatcher](#type-cachekeymatcher)? | Matches [cache keys](#type-cachekey) to prune. By default all are matched. |

#### Fires

- [Cache event prune](#cache-event-prune)
- [Cache event delete](#cache-event-delete)

#### Examples

_Ways to `import`._

> ```js
> import { cachePrune } from 'graphql-react';
> ```
>
> ```js
> import cachePrune from 'graphql-react/public/cachePrune.js';
> ```

_Ways to `require`._

> ```js
> const { cachePrune } = require('graphql-react');
> ```
>
> ```js
> const cachePrune = require('graphql-react/public/cachePrune.js');
> ```

---

### function cacheStale

Stales [cache](#cache-instance-property-store) entries. Useful after a mutation.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cache` | [Cache](#class-cache) | Cache to update. |
| `cacheKeyMatcher` | [CacheKeyMatcher](#type-cachekeymatcher)? | Matches [cache keys](#type-cachekey) to stale. By default all are matched. |

#### Fires

- [Cache event stale](#cache-event-stale)

#### Examples

_Ways to `import`._

> ```js
> import { cacheStale } from 'graphql-react';
> ```
>
> ```js
> import cacheStale from 'graphql-react/public/cacheStale.js';
> ```

_Ways to `require`._

> ```js
> const { cacheStale } = require('graphql-react');
> ```
>
> ```js
> const cacheStale = require('graphql-react/public/cacheStale.js');
> ```

---

### function fetchGraphQL

Fetches a GraphQL operation, always resolving a [GraphQL result](#type-graphqlresult) suitable for use as a [cache value](#type-cachevalue), even if there are errors. Loading errors are added to the [GraphQL result](#type-graphqlresult) `errors` property, and have an `extensions` property containing `client: true`, along with `code` and sometimes error-specific properties:

| Error code | Reasons | Error specific properties |
| :-- | :-- | :-- |
| `FETCH_ERROR` | Fetch error, e.g. the `fetch` global isn’t defined, or the network is offline. | `fetchErrorMessage` (string). |
| `RESPONSE_HTTP_STATUS` | Response HTTP status code is in the error range. | `statusCode` (number), `statusText` (string). |
| `RESPONSE_JSON_PARSE_ERROR` | Response JSON parse error. | `jsonParseErrorMessage` (string). |
| `RESPONSE_MALFORMED` | Response JSON isn’t an object, is missing an `errors` or `data` property, the `errors` property isn’t an array, or the `data` property isn’t an object or `null`. |  |

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `fetchUri` | string | Fetch URI for the GraphQL API. |
| `fetchOptions` | [FetchOptions](#type-fetchoptions) | Fetch options. |

**Returns:** Promise<[GraphQLResult](#type-graphqlresult)> — Resolves a result suitable for use as a [cache value](#type-cachevalue). Shouldn’t reject.

#### Examples

_Ways to `import`._

> ```js
> import { fetchGraphQL } from 'graphql-react';
> ```
>
> ```js
> import fetchGraphQL from 'graphql-react/public/fetchGraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { fetchGraphQL } = require('graphql-react');
> ```
>
> ```js
> const fetchGraphQL = require('graphql-react/public/fetchGraphQL.js');
> ```

---

### function fetchOptionsGraphQL

Creates default [`fetch` options](#type-fetchoptions) for a [GraphQL operation](#type-graphqloperation). If the [GraphQL operation](#type-graphqloperation) contains files to upload, the options will be for a [GraphQL multipart request](https://github.com/jaydenseric/graphql-multipart-request-spec), otherwise they will be for a regular [GraphQL `POST` request](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#post).

This utility exists for user convenience and isn’t used directly by the `graphql-react` API. If there is no chance the [GraphQL operation](#type-graphqloperation) contains files, avoid using this utility for a smaller bundle size.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `operation` | [GraphQLOperation](#type-graphqloperation) | GraphQL operation. |

**Returns:** [FetchOptions](#type-fetchoptions) — [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.

#### Examples

_Ways to `import`._

> ```js
> import { fetchOptionsGraphQL } from 'graphql-react';
> ```
>
> ```js
> import fetchOptionsGraphQL from 'graphql-react/public/fetchOptionsGraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { fetchOptionsGraphQL } = require('graphql-react');
> ```
>
> ```js
> const fetchOptionsGraphQL = require('graphql-react/public/fetchOptionsGraphQL.js');
> ```

---

### function Provider

A React component to provide all the React context required to enable the entire `graphql-react` API:

- [Hydration time stamp context](#member-hydrationtimestampcontext)
- [Cache context](#member-cachecontext)
- [Loading context](#member-loadingcontext)

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `props` | object | Component props. |
| `props.cache` | [Cache](#class-cache) | [`Cache`](#class-cache) instance. |
| `props.children` | [ReactNode](#type-reactnode)? | React children. |

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

#### Examples

_Ways to `import`._

> ```js
> import { Provider } from 'graphql-react';
> ```
>
> ```js
> import Provider from 'graphql-react/public/Provider.js';
> ```

_Ways to `require`._

> ```js
> const { Provider } = require('graphql-react');
> ```
>
> ```js
> const Provider = require('graphql-react/public/Provider.js');
> ```

_Provide a [`Cache`](#class-cache) instance for an app._

> ```jsx
> import { Cache, Provider } from 'graphql-react';
> import React from 'react';
>
> const cache = new Cache();
>
> const App = ({ children }) => <Provider cache={cache}>{children}</Provider>;
> ```

---

### function useAutoAbortLoad

A React hook to create a memoized [loader](#type-loader) from another, that automatically aborts previous loading that started via this hook when new loading starts via this hook, the hook arguments change, or the component unmounts.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

**Returns:** [Loader](#type-loader) — Memoized function that starts the loading.

#### Examples

_Ways to `import`._

> ```js
> import { useAutoAbortLoad } from 'graphql-react';
> ```
>
> ```js
> import useAutoAbortLoad from 'graphql-react/public/useAutoAbortLoad.js';
> ```

_Ways to `require`._

> ```js
> const { useAutoAbortLoad } = require('graphql-react');
> ```
>
> ```js
> const useAutoAbortLoad = require('graphql-react/public/useAutoAbortLoad.js');
> ```

---

### function useAutoLoad

A React hook to prevent a [cache](#cache-instance-property-store) entry from being pruned while the component is mounted and automatically keep it loaded. Previous loading that started via this hook aborts when new loading starts via this hook, the hook arguments change, or the component unmounts.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

**Returns:** [Loader](#type-loader) — Memoized [loader](#type-loader) created from the `load` argument, that automatically aborts the last loading when the memoized function changes or the component unmounts.

#### See

- [`useCacheEntryPrunePrevention`](#function-usecacheentrypruneprevention), used by this hook.
- [`useAutoAbortLoad`](#function-useautoabortload), used by this hook.
- [`useLoadOnMount`](#function-useloadonmount), used by this hook.
- [`useLoadOnStale`](#function-useloadonstale), used by this hook.
- [`useLoadOnDelete`](#function-useloadondelete), used by this hook.
- [`useWaterfallLoad`](#function-usewaterfallload), often used alongside this hook for SSR loading.

#### Examples

_Ways to `import`._

> ```js
> import { useAutoLoad } from 'graphql-react';
> ```
>
> ```js
> import useAutoLoad from 'graphql-react/public/useAutoLoad.js';
> ```

_Ways to `require`._

> ```js
> const { useAutoLoad } = require('graphql-react');
> ```
>
> ```js
> const useAutoLoad = require('graphql-react/public/useAutoLoad.js');
> ```

---

### function useCache

A React hook to get the [cache context](#member-cachecontext).

**Returns:** [Cache](#class-cache) — The cache.

#### Examples

_Ways to `import`._

> ```js
> import { useCache } from 'graphql-react';
> ```
>
> ```js
> import useCache from 'graphql-react/public/useCache.js';
> ```

_Ways to `require`._

> ```js
> const { useCache } = require('graphql-react');
> ```
>
> ```js
> const useCache = require('graphql-react/public/useCache.js');
> ```

---

### function useCacheEntry

A React hook to get a [cache value](#type-cachevalue) using its [cache key](#type-cachekey).

| Parameter  | Type                       | Description |
| :--------- | :------------------------- | :---------- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.  |

**Returns:** [CacheValue](#type-cachevalue) — Cache value, if present.

#### Examples

_Ways to `import`._

> ```js
> import { useCacheEntry } from 'graphql-react';
> ```
>
> ```js
> import useCacheEntry from 'graphql-react/public/useCacheEntry.js';
> ```

_Ways to `require`._

> ```js
> const { useCacheEntry } = require('graphql-react');
> ```
>
> ```js
> const useCacheEntry = require('graphql-react/public/useCacheEntry.js');
> ```

---

### function useCacheEntryPrunePrevention

A React hook to prevent a [cache](#cache-instance-property-store) entry from being pruned, by canceling the cache entry deletion for [prune events](#cache-event-prune) with `event.preventDefault()`.

| Parameter  | Type                       | Description |
| :--------- | :------------------------- | :---------- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.  |

#### Examples

_Ways to `import`._

> ```js
> import { useCacheEntryPrunePrevention } from 'graphql-react';
> ```
>
> ```js
> import useCacheEntryPrunePrevention from 'graphql-react/public/useCacheEntryPrunePrevention.js';
> ```

_Ways to `require`._

> ```js
> const { useCacheEntryPrunePrevention } = require('graphql-react');
> ```
>
> ```js
> const useCacheEntryPrunePrevention = require('graphql-react/public/useCacheEntryPrunePrevention.js');
> ```

---

### function useLoadGraphQL

A React hook to get a function for loading a GraphQL operation.

**Returns:** [LoadGraphQL](#type-loadgraphql) — Loads a GraphQL operation.

#### Examples

_Ways to `import`._

> ```js
> import { useLoadGraphQL } from 'graphql-react';
> ```
>
> ```js
> import useLoadGraphQL from 'graphql-react/public/useLoadGraphQL.js';
> ```

_Ways to `require`._

> ```js
> const { useLoadGraphQL } = require('graphql-react');
> ```
>
> ```js
> const useLoadGraphQL = require('graphql-react/public/useLoadGraphQL.js');
> ```

---

### function useLoading

A React hook to get the [loading context](#member-loadingcontext).

**Returns:** [Loading](#class-loading) — Loading.

#### Examples

_Ways to `import`._

> ```js
> import { useLoading } from 'graphql-react';
> ```
>
> ```js
> import useLoading from 'graphql-react/public/useLoading.js';
> ```

_Ways to `require`._

> ```js
> const { useLoading } = require('graphql-react');
> ```
>
> ```js
> const useLoading = require('graphql-react/public/useLoading.js');
> ```

---

### function useLoadingEntry

A React hook to get the [loading cache values](#class-loadingcachevalue) for a given [cache key](#type-cachekey).

| Parameter  | Type                       | Description |
| :--------- | :------------------------- | :---------- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.  |

**Returns:** Set<[LoadingCacheValue](#class-loadingcachevalue)> | `undefined` — Loading cache values, if present.

#### Examples

_Ways to `import`._

> ```js
> import { useLoadingEntry } from 'graphql-react';
> ```
>
> ```js
> import useLoadingEntry from 'graphql-react/public/useLoadingEntry.js';
> ```

_Ways to `require`._

> ```js
> const { useLoadingEntry } = require('graphql-react');
> ```
>
> ```js
> const useLoadingEntry = require('graphql-react/public/useLoadingEntry.js');
> ```

---

### function useLoadOnDelete

A React hook to load a [cache](#cache-instance-property-store) entry after it’s [deleted](#cache-event-delete), if there isn’t loading for the [cache key](#type-cachekey) that started after.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

#### Examples

_Ways to `import`._

> ```js
> import { useLoadOnDelete } from 'graphql-react';
> ```
>
> ```js
> import useLoadOnDelete from 'graphql-react/public/useLoadOnDelete.js';
> ```

_Ways to `require`._

> ```js
> const { useLoadOnDelete } = require('graphql-react');
> ```
>
> ```js
> const useLoadOnDelete = require('graphql-react/public/useLoadOnDelete.js');
> ```

---

### function useLoadOnMount

A React hook to automatically load a [cache](#cache-instance-property-store) entry after the component mounts or the [cache context](#member-cachecontext) or any of the arguments change, except during the [hydration time](#constant-hydration_time_ms) if the [hydration time stamp context](#member-hydrationtimestampcontext) is populated and the [cache](#cache-instance-property-store) entry is already populated.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

#### Examples

_Ways to `import`._

> ```js
> import { useLoadOnMount } from 'graphql-react';
> ```
>
> ```js
> import useLoadOnMount from 'graphql-react/public/useLoadOnMount.js';
> ```

_Ways to `require`._

> ```js
> const { useLoadOnMount } = require('graphql-react');
> ```
>
> ```js
> const useLoadOnMount = require('graphql-react/public/useLoadOnMount.js');
> ```

---

### function useLoadOnStale

A React hook to load a [cache](#cache-instance-property-store) entry after becomes [stale](#cache-event-stale), if there isn’t loading for the [cache key](#type-cachekey) that started after.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

#### Examples

_Ways to `import`._

> ```js
> import { useLoadOnStale } from 'graphql-react';
> ```
>
> ```js
> import useLoadOnStale from 'graphql-react/public/useLoadOnStale.js';
> ```

_Ways to `require`._

> ```js
> const { useLoadOnStale } = require('graphql-react');
> ```
>
> ```js
> const useLoadOnStale = require('graphql-react/public/useLoadOnStale.js');
> ```

---

### function useWaterfallLoad

A React hook to load a [cache](#cache-instance-property-store) entry if the [waterfall render context](https://github.com/jaydenseric/react-waterfall-render#member-waterfallrendercontext) is populated, i.e. when [waterfall rendering](https://github.com/jaydenseric/react-waterfall-render#function-waterfallrender) for either a server side render or to preload components in a browser environment.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key. |
| `load` | [Loader](#type-loader) | Memoized function that starts the loading. |

**Returns:** boolean — Did loading start. If so, it’s efficient for the component to return `null` since this render will be discarded anyway for a re-render onces the loading ends.

#### See

- [`useAutoLoad`](#function-useautoload), often used alongside this hook.

#### Examples

_Ways to `import`._

> ```js
> import { useWaterfallLoad } from 'graphql-react';
> ```
>
> ```js
> import useWaterfallLoad from 'graphql-react/public/useWaterfallLoad.js';
> ```

_Ways to `require`._

> ```js
> const { useWaterfallLoad } = require('graphql-react');
> ```
>
> ```js
> const useWaterfallLoad = require('graphql-react/public/useWaterfallLoad.js');
> ```

---

### member CacheContext

React context for a [`Cache`](#class-cache) instance.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `Provider` | Function | [React context provider component](https://reactjs.org/docs/context.html#contextprovider). |
| `Consumer` | Function | [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer). |

#### Examples

_Ways to `import`._

> ```js
> import { CacheContext } from 'graphql-react';
> ```
>
> ```js
> import CacheContext from 'graphql-react/public/CacheContext.js';
> ```

_Ways to `require`._

> ```js
> const { CacheContext } = require('graphql-react');
> ```
>
> ```js
> const CacheContext = require('graphql-react/public/CacheContext.js');
> ```

---

### member HydrationTimeStampContext

React context for the client side hydration [time stamp](#type-highrestimestamp).

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `Provider` | Function | [React context provider component](https://reactjs.org/docs/context.html#contextprovider). |
| `Consumer` | Function | [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer). |

#### Examples

_Ways to `import`._

> ```js
> import { HydrationTimeStampContext } from 'graphql-react';
> ```
>
> ```js
> import HydrationTimeStampContext from 'graphql-react/public/HydrationTimeStampContext.js';
> ```

_Ways to `require`._

> ```js
> const { HydrationTimeStampContext } = require('graphql-react');
> ```
>
> ```js
> const HydrationTimeStampContext = require('graphql-react/public/HydrationTimeStampContext.js');
> ```

---

### member LoadingContext

React context for a [`Loading`](#class-loading) instance.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `Provider` | Function | [React context provider component](https://reactjs.org/docs/context.html#contextprovider). |
| `Consumer` | Function | [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer). |

#### Examples

_Ways to `import`._

> ```js
> import { LoadingContext } from 'graphql-react';
> ```
>
> ```js
> import LoadingContext from 'graphql-react/public/LoadingContext.js';
> ```

_Ways to `require`._

> ```js
> const { LoadingContext } = require('graphql-react');
> ```
>
> ```js
> const LoadingContext = require('graphql-react/public/LoadingContext.js');
> ```

---

### constant HYDRATION_TIME_MS

Number of milliseconds after the first client render that’s considered the hydration time; during which the [`useAutoLoad`](#function-useautoload) React hook won’t load if the cache entry is already populated.

**Type:** number

#### Examples

_Ways to `import`._

> ```js
> import { HYDRATION_TIME_MS } from 'graphql-react';
> ```
>
> ```js
> import HYDRATION_TIME_MS from 'graphql-react/public/HYDRATION_TIME_MS.js';
> ```

_Ways to `require`._

> ```js
> const { HYDRATION_TIME_MS } = require('graphql-react');
> ```
>
> ```js
> const HYDRATION_TIME_MS = require('graphql-react/public/HYDRATION_TIME_MS.js');
> ```

---

### type CacheKey

A unique key to access a [cache value](#type-cachevalue).

**Type:** string

---

### type CacheKeyMatcher

Matches a [cache key](#type-cachekey) against a custom condition.

**Type:** Function

| Parameter  | Type                       | Description |
| :--------- | :------------------------- | :---------- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key.  |

**Returns:** boolean — Does the [cache key](#type-cachekey) match the custom condition.

---

### type CacheValue

A [cache](#cache-instance-property-store) value. If server side rendering, it should be JSON serializable for client hydration. It should contain information about any errors that occurred during loading so they can be rendered, and if server side rendering, be hydrated on the client.

**Type:** \*

---

### type FetchOptions

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) options, called `init` in official specs.

**Type:** object

#### See

- [MDN `fetch` parameters docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
- [Polyfillable `fetch` options](https://github.github.io/fetch/#options). Don’t use other options if `fetch` is polyfilled for Node.js or legacy browsers.

---

### type GraphQLOperation

A GraphQL operation. Additional properties may be used; all are sent to the GraphQL server.

**Type:** object

| Property    | Type    | Description                    |
| :---------- | :------ | :----------------------------- |
| `query`     | string  | GraphQL queries or mutations.  |
| `variables` | object? | Variables used in the `query`. |

---

### type GraphQLResult

A GraphQL result.

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `data` | object? | GraphQL response data. |
| `errors` | Array<[GraphQLResultError](#type-graphqlresulterror)>? | GraphQL response errors from the server, along with any loading errors added on the client. |

#### See

- [GraphQL spec for a response](https://spec.graphql.org/June2018/#sec-Response).

---

### type GraphQLResultError

A GraphQL result error; either created by the GraphQL server, or by whatever loaded the GraphQL on the client (e.g. [`fetchGraphQL`](#function-fetchgraphql)).

**Type:** object

| Property | Type | Description |
| :-- | :-- | :-- |
| `message` | object | Error message. |
| `locations` | Array<{line: number, column: number}>? | GraphQL query locations related to the error. |
| `path` | Array<string>? | [GraphQL result](#type-graphqlresult) `data` field path related to the error. |
| `extensions` | object? | Custom error data. If the error was created on the client and not the GraphQL server, this property should be present and contain at least `client: true`, although `code` and error specific properties may be present. |

#### See

- [GraphQL spec for response errors](https://spec.graphql.org/June2018/#sec-Errors).

---

### type HighResTimeStamp

Milliseconds since the [performance time origin](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timeOrigin) (when the current JavaScript environment started running).

**Type:** number

#### See

- [MDN `DOMHighResTimeStamp` docs](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp).

---

### type Loader

Starts [loading a cache value](#class-loadingcachevalue).

**Type:** Function

**Returns:** [LoadingCacheValue](#class-loadingcachevalue) — The loading cache value.

---

### type LoadGraphQL

Loads a GraphQL operation, using the [GraphQL fetcher](#function-fetchgraphql).

**Type:** [Loader](#type-loader)

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `cacheKey` | [CacheKey](#type-cachekey) | Cache key to store the loading result under. |
| `fetchUri` | string | [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) URI. |
| `fetchOptions` | [FetchOptions](#type-fetchoptions) | [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) options. |

**Returns:** [LoadingCacheValue](#class-loadingcachevalue) — The loading cache value.

---

### type ReactNode

A React virtual DOM node; anything that can be rendered.

**Type:** `undefined` | `null` | boolean | number | string | React.Element | Array<[ReactNode](#type-reactnode)>
