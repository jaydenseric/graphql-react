![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

A [GraphQL](https://graphql.org) client for [React](https://reactjs.org) using modern [context](https://reactjs.org/docs/context) and [hooks](https://reactjs.org/docs/hooks-intro) APIs that’s lightweight (< 4 kB) but powerful; the first [Relay](https://relay.dev) and [Apollo](https://apollographql.com/apollo-client) alternative with server side rendering.

The [exports](#exports) can also be used to custom load, cache and server side render any data, even from non-[GraphQL](https://graphql.org) sources.

- [Installation](#installation)
- [Examples](#examples)
- [Requirements](#requirements)
- [Exports](#exports)

## Installation

> **Note**
>
> For a [Next.js](https://nextjs.org) project, see the [`next-graphql-react`](https://npm.im/next-graphql-react) installation instructions.

For [Node.js](https://nodejs.org), to install [`graphql-react`](https://npm.im/graphql-react) and its [`react`](https://npm.im/react) peer dependency with [npm](https://npmjs.com/get-npm), run:

```sh
npm install graphql-react react
```

For [Deno](https://deno.land) and browsers, an example import map (realistically use 4 import maps, with optimal URLs for server vs client and development vs production):

```json
{
  "imports": {
    "extract-files/": "https://unpkg.com/extract-files@13.0.0/",
    "graphql-react/": "https://unpkg.com/graphql-react@20.0.0/",
    "is-plain-obj": "https://unpkg.com/is-plain-obj@4.1.0/index.js",
    "is-plain-obj/": "https://unpkg.com/is-plain-obj@4.1.0/",
    "react": "https://esm.sh/react@18.2.0",
    "react-waterfall-render/": "https://unpkg.com/react-waterfall-render@5.0.0/"
  }
}
```

These dependencies might not need to be in the import map, depending on what [`graphql-react`](https://npm.im/graphql-react) modules the project imports from:

- [`extract-files`](https://npm.im/extract-files)
- [`is-plain-obj`](https://npm.im/is-plain-obj)
- [`react-waterfall-render`](https://npm.im/react-waterfall-render)

Polyfill any required globals (see [_**Requirements**_](#requirements)) that are missing in your server and client environments.

Create a single [`Cache`](./Cache.mjs) instance and use the component [`Provider`](./Provider.mjs) to provide it for your app.

To server side render your app, use the function [`waterfallRender`](https://github.com/jaydenseric/react-waterfall-render#exports) from [`react-waterfall-render`](https://npm.im/react-waterfall-render).

## Examples

- [`graphql-react` examples repo](https://github.com/jaydenseric/graphql-react-examples), a [Deno](https://deno.land) [Ruck](https://ruck.tech) web app deployed at [graphql-react-examples.fly.dev](https://graphql-react-examples.fly.dev).
- [Official Next.js example](https://github.com/vercel/next.js/tree/canary/examples/with-graphql-react) (often outdated as the Next.js team can be extremely slow to review and merge pull requests).

Here is a basic example using the [GitHub GraphQL API](https://docs.github.com/en/graphql), with tips commented:

```jsx
import useAutoLoad from "graphql-react/useAutoLoad.mjs";
import useCacheEntry from "graphql-react/useCacheEntry.mjs";
import useLoadGraphQL from "graphql-react/useLoadGraphQL.mjs";
import useWaterfallLoad from "graphql-react/useWaterfallLoad.mjs";
import React from "react";

// The query is just a string; no need to use `gql` from `graphql-tag`. The
// special comment before the string allows editor syntax highlighting, Prettier
// formatting and linting. The cache system doesn’t require `__typename` or `id`
// fields to be queried.
const query = /* GraphQL */ `
  query ($repoId: ID!) {
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

  const load = React.useCallback(
    () =>
      // To be DRY, utilize a custom hook for each API your app loads from, e.g.
      // `useLoadGraphQLGitHub`.
      loadGraphQL(
        cacheKey,
        // Fetch URI.
        "https://api.github.com/graphql",
        // Fetch options.
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
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
  // to set it up for a non-Next.js app, see:
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
        "Error!"
      : cacheValue.data.repo.stargazers.totalCount
    : // In this situation no cache value implies loading. Use the
      // `useLoadingEntry` hook to manage loading in detail.
      "Loading…";
}
```

## Requirements

Supported runtime environments:

- [Node.js](https://nodejs.org) versions `^14.17.0 || ^16.0.0 || >= 18.0.0`.
- [Deno](https://deno.land), importing from a CDN that might require an import map for dependencies.
- Browsers matching the [Browserslist](https://browsersl.ist) query [`> 0.5%, not OperaMini all, not dead`](https://browsersl.ist/?q=%3E+0.5%25%2C+not+OperaMini+all%2C+not+dead).

Consider polyfilling:

- [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/Window/performance)

Non [Deno](https://deno.land) projects must configure [TypeScript](https://typescriptlang.org) to use types from the ECMAScript modules that have a `// @ts-check` comment:

- [`compilerOptions.allowJs`](https://typescriptlang.org/tsconfig#allowJs) should be `true`.
- [`compilerOptions.maxNodeModuleJsDepth`](https://typescriptlang.org/tsconfig#maxNodeModuleJsDepth) should be reasonably large, e.g. `10`.
- [`compilerOptions.module`](https://typescriptlang.org/tsconfig#module) should be `"node16"` or `"nodenext"`.

## Exports

The [npm](https://npmjs.com) package [`graphql-react`](https://npm.im/graphql-react) features [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design). It doesn’t have a main index module, so use deep imports from the ECMAScript modules that are exported via the [`package.json`](./package.json) field [`exports`](https://nodejs.org/api/packages.html#exports):

- [`Cache.mjs`](./Cache.mjs)
- [`CacheContext.mjs`](./CacheContext.mjs)
- [`cacheDelete.mjs`](./cacheDelete.mjs)
- [`cacheEntryDelete.mjs`](./cacheEntryDelete.mjs)
- [`cacheEntryPrune.mjs`](./cacheEntryPrune.mjs)
- [`cacheEntrySet.mjs`](./cacheEntrySet.mjs)
- [`cacheEntryStale.mjs`](./cacheEntryStale.mjs)
- [`cachePrune.mjs`](./cachePrune.mjs)
- [`cacheStale.mjs`](./cacheStale.mjs)
- [`fetchGraphQL.mjs`](./fetchGraphQL.mjs)
- [`fetchOptionsGraphQL.mjs`](./fetchOptionsGraphQL.mjs)
- [`HYDRATION_TIME_MS.mjs`](./HYDRATION_TIME_MS.mjs)
- [`HydrationTimeStampContext.mjs`](./HydrationTimeStampContext.mjs)
- [`Loading.mjs`](./Loading.mjs)
- [`LoadingCacheValue.mjs`](./LoadingCacheValue.mjs)
- [`LoadingContext.mjs`](./LoadingContext.mjs)
- [`Provider.mjs`](./Provider.mjs)
- [`types.mjs`](./types.mjs)
- [`useAutoAbortLoad.mjs`](./useAutoAbortLoad.mjs)
- [`useAutoLoad.mjs`](./useAutoLoad.mjs)
- [`useCache.mjs`](./useCache.mjs)
- [`useCacheEntry.mjs`](./useCacheEntry.mjs)
- [`useCacheEntryPrunePrevention.mjs`](./useCacheEntryPrunePrevention.mjs)
- [`useLoadGraphQL.mjs`](./useLoadGraphQL.mjs)
- [`useLoading.mjs`](./useLoading.mjs)
- [`useLoadingEntry.mjs`](./useLoadingEntry.mjs)
- [`useLoadOnDelete.mjs`](./useLoadOnDelete.mjs)
- [`useLoadOnMount.mjs`](./useLoadOnMount.mjs)
- [`useLoadOnStale.mjs`](./useLoadOnStale.mjs)
- [`useWaterfallLoad.mjs`](./useWaterfallLoad.mjs")
