![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

[![npm version](https://badgen.net/npm/v/graphql-react)](https://npm.im/graphql-react) [![Build status](https://travis-ci.org/jaydenseric/graphql-react.svg?branch=master)](https://travis-ci.org/jaydenseric/graphql-react)

A lightweight GraphQL client for React; the first Relay and Apollo alternative with server side rendering.

### Easy 🔥

- Add 1 dependency to get started with GraphQL in a React project.
- No Webpack or Babel setup.
- Simple components, no decorators.
- Query components fetch on mount and when props change. While loading, cache from the last identical request is available to display.
- Automatically fresh cache, even after mutations.
- Use file input values as mutation arguments to upload files; compatible with [a variety of servers](https://github.com/jaydenseric/graphql-multipart-request-spec#server).
- [Template literal](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) queries; no need for [`gql`](https://github.com/apollographql/graphql-tag#gql).
- Query multiple GraphQL APIs.

### Smart 💡

- Adds only a few KB to a typical min+gzip bundle.
- [Native ESM in Node.js](https://nodejs.org/api/esm.html) via `.mjs`.
- [Package `module` entry](https://github.com/rollup/rollup/wiki/pkg.module) for [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers.
- Server side rendering for crawlable pages and a better UX.
- Components use the [React v16.3 context API](https://github.com/facebook/react/pull/11818).
- **_All_** fetch options overridable per request.
- GraphQL request fetch options hash based cache:
  - No data denormalization or need to query `id` fields.
  - No tampering with queries or `__typename` insertion.
  - Errors are cached and can be server side rendered.
  - Query multiple GraphQL APIs without stitching data.

## Setup

To install [`graphql-react`](https://npm.im/graphql-react) from [npm](https://npmjs.com) run:

```sh
npm install graphql-react
```

Create and provide a single [`GraphQL`](#class-graphql) client to hold the cache for all the queries in your app:

```jsx
import { GraphQL, Provider } from 'graphql-react'

const graphql = new GraphQL()

export const App = ({ children }) => (
  <Provider value={graphql}>{children}</Provider>
)
```

[`GraphQL`](#class-graphql) accepts a single `cache` option for hydration after SSR; see [**_Example_**](#example).

Setup is simple because [`Query`](#function-query) components determine their own fetch options (such as the GraphQL endpoint URI). Multiple GraphQL APIs can be used in an app 🤯

## Usage

Use the [`Query`](#function-query) component for queries and mutations throughout your app:

```jsx
import { Query } from 'graphql-react'

export const PokemonViewer = ({ name }) => (
  <Query
    loadOnMount
    loadOnReset
    fetchOptionsOverride={options => {
      options.url = 'https://graphql-pokemon.now.sh'
    }}
    variables={{ name }}
    query={
      /* GraphQL */ `
        query pokemon($name: String!) {
          pokemon(name: $name) {
            number
            image
          }
        }
      `
    }
  >
    {({ loading, data }) =>
      data ? (
        <figure>
          <img src={data.image} alt={name} />
          <figcaption>
            Pokémon #{data.number}: {name}
          </figcaption>
        </figure>
      ) : loading ? (
        <p>Loading…</p>
      ) : (
        <p>Error!</p>
      )
    }
  </Query>
)
```

To make queries and mutations without a component, use the [`GraphQL` instance method `query`](#graphql-instance-method-query).

## Example

See the [example GraphQL API and Next.js web app](https://github.com/jaydenseric/graphql-react-examples), deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

## Support

- Node.js v8.5+.
- Browsers [>1% usage](http://browserl.ist/?q=%3E1%25).

Consider polyfilling:

- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API)

## API

### Table of contents

- [class GraphQL](#class-graphql)
  - [Examples](#examples)
  - [GraphQL instance method query](#graphql-instance-method-query)
  - [GraphQL instance method reset](#graphql-instance-method-reset)
    - [Examples](#examples-1)
  - [GraphQL instance property cache](#graphql-instance-property-cache)
    - [Examples](#examples-2)
- [function Consumer](#function-consumer)
  - [Examples](#examples-3)
- [function preload](#function-preload)
  - [Examples](#examples-4)
- [function Provider](#function-provider)
  - [Examples](#examples-5)
- [function Query](#function-query)
  - [Examples](#examples-6)
- [type ActiveQuery](#type-activequery)
- [type ConsumerRender](#type-consumerrender)
  - [Examples](#examples-7)
- [type FetchOptions](#type-fetchoptions)
- [type FetchOptionsOverride](#type-fetchoptionsoverride)
  - [Examples](#examples-8)
- [type GraphQLOperation](#type-graphqloperation)
- [type HttpError](#type-httperror)
- [type QueryRender](#type-queryrender)
  - [Examples](#examples-9)
- [type RequestCache](#type-requestcache)

### class GraphQL

A lightweight GraphQL client that caches requests.

| Parameter       | Type                                    | Description                                         |
| :-------------- | :-------------------------------------- | :-------------------------------------------------- |
| `options`       | [Object](https://mdn.io/object)? = `{}` | Options.                                            |
| `options.cache` | [Object](https://mdn.io/object)? = `{}` | Cache to import; usually from a server side render. |

#### Examples

_Constructing a new GraphQL client._

> ```js
> import { GraphQL } from 'graphql-react'
>
> const graphql = new GraphQL()
> ```

#### GraphQL instance method query

Queries a GraphQL server.

| Parameter                      | Type                                                | Description                                                                              |
| :----------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `options`                      | [Object](https://mdn.io/object)                     | Options.                                                                                 |
| `options.operation`            | [GraphQLOperation](#type-graphqloperation)          | GraphQL operation.                                                                       |
| `options.fetchOptionsOverride` | [FetchOptionsOverride](#type-fetchoptionsoverride)? | Overrides default GraphQL request [fetch options](#type-fetchoptions).                   |
| `options.resetOnLoad`          | [boolean](https://mdn.io/boolean)? = `false`        | Should the [GraphQL cache](#graphql-instance-property-cache) reset when the query loads. |

**Returns:** [ActiveQuery](#type-activequery) — Loading query details.

#### GraphQL instance method reset

Resets the [GraphQL cache](#graphql-instance-property-cache). Useful when a user logs out.

| Parameter                | Type                             | Description                                                                                                                                               |
| :----------------------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exceptFetchOptionsHash` | [string](https://mdn.io/string)? | A [fetch options](#type-fetchoptions) hash for cache to exempt from deletion. Useful for resetting cache after a mutation, preserving the mutation cache. |

##### Examples

_Resetting the GraphQL cache._

> ```js
> graphql.reset()
> ```

#### GraphQL instance property cache

GraphQL [request cache](#type-requestcache) map, keyed by [fetch options](#type-fetchoptions) hashes.

##### Examples

_Export cache as JSON._

> ```js
> const exportedCache = JSON.stringify(graphql.cache)
> ```

### function Consumer

A React component that gets the [`GraphQL`](#class-graphql) instance from context.

| Parameter  | Type                                   | Description                                                           |
| :--------- | :------------------------------------- | :-------------------------------------------------------------------- |
| `children` | [ConsumerRender](#type-consumerrender) | Render function that receives a [`GraphQL`](#class-graphql) instance. |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_A button component that resets the [GraphQL cache](#graphql-instance-property-cache)._

> ```jsx
> import { Consumer } from 'graphql-react'
>
> const ResetCacheButton = () => (
>   <Consumer>
>     {graphql => <button onClick={graphql.reset}>Reset cache</button>}
>   </Consumer>
> )
> ```

### function preload

Recursively preloads [`Query`](#function-query) components that have the `loadOnMount` prop in a React element tree. Useful for server side rendering (SSR) or to preload components for a better user experience when they mount.

| Parameter | Type         | Description                  |
| :-------- | :----------- | :--------------------------- |
| `element` | ReactElement | A React virtual DOM element. |

**Returns:** [Promise](https://mdn.io/promise) — Resolves once loading is done and cache is ready to be exported from the [`GraphQL`](#class-graphql) instance. Cache can be imported when constructing new [`GraphQL`](#class-graphql) instances.

#### Examples

_An async SSR function that returns a HTML string and cache JSON for client hydration._

> ```jsx
> import { GraphQL, preload, Provider } from 'graphql-react'
> import { renderToString } from 'react-dom/server'
> import { App } from './components'
>
> const graphql = new GraphQL()
> const page = (
>   <Provider value={graphql}>
>     <App />
>   </Provider>
> )
>
> export async function ssr() {
>   await preload(page)
>   return {
>     cache: JSON.stringify(graphql.cache),
>     html: renderToString(page)
>   }
> }
> ```

### function Provider

A React component that provides a [`GraphQL`](#class-graphql) instance in context for nested [`Consumer`](#function-consumer) components to use.

| Parameter  | Type                      | Description                             |
| :--------- | :------------------------ | :-------------------------------------- |
| `value`    | [GraphQL](#class-graphql) | A [`GraphQL`](#class-graphql) instance. |
| `children` | ReactNode                 | A React node.                           |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_Using the `Provider` component for a page._

> ```jsx
> import { GraphQL, Provider } from 'graphql-react'
>
> const graphql = new GraphQL()
>
> const Page = () => (
>   <Provider value={graphql}>Use Consumer or Query components…</Provider>
> )
> ```

### function Query

A React component to manage a GraphQL query or mutation.

| Parameter                    | Type                                                | Description                                                                                |
| :--------------------------- | :-------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `props`                      | [Object](https://mdn.io/object)                     | Component props.                                                                           |
| `props.operation`            | [GraphQLOperation](#type-graphqloperation)          | GraphQL operation.                                                                         |
| `props.fetchOptionsOverride` | [FetchOptionsOverride](#type-fetchoptionsoverride)? | Overrides default GraphQL request [fetch options](#type-fetchoptions).                     |
| `props.loadOnMount`          | [boolean](https://mdn.io/boolean)? = `false`        | Should the query load when the component mounts.                                           |
| `props.loadOnReset`          | [boolean](https://mdn.io/boolean)? = `false`        | Should the query load when the [GraphQL cache](#graphql-instance-property-cache) is reset. |
| `props.resetOnLoad`          | [boolean](https://mdn.io/boolean)? = `false`        | Should the [GraphQL cache](#graphql-instance-property-cache) reset when the query loads.   |
| `props.children`             | [QueryRender](#type-queryrender)                    | Renders the query status.                                                                  |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_A query to display a user profile._

> ```jsx
> import { Query } from 'graphql-react'
>
> const Profile = ({ userId }) => (
>   <Query
>     loadOnMount
>     loadOnReset
>     fetchOptionsOverride={options => {
>      options.url = 'https://api.example.com/graphql'
>     }}
>     operation={
>       variables: { userId },
>       query: `
>         query user($userId: ID!) {
>           user(userId: $userId) {
>             name
>           }
>         }
>       `
>     }
>   >
>     {({
>       load,
>       loading,
>       fetchError,
>       httpError,
>       parseError,
>       graphQLErrors,
>       data
>     }) => (
>       <article>
>         <button onClick={load}>Reload</button>
>         {loading && <span>Loading…</span>}
>         {(fetchError || httpError || parseError || graphQLErrors) && (
>           <strong>Error!</strong>
>         )}
>         {data && <h1>{data.user.name}</h1>}
>       </article>
>     )}
>   </Query>
> )
> ```

_A mutation to clap an article._

> ```jsx
> import { Query } from 'graphql-react'
>
> const ClapArticleButton = ({ articleId }) => (
>   <Query
>     resetOnLoad
>     fetchOptionsOverride={options => {
>       options.url = 'https://api.example.com/graphql'
>     }}
>     operation={
>       variables: { articleId },
>       query: `
>         mutation clapArticle($articleId: ID!) {
>           clapArticle(articleId: $articleId) {
>             clapCount
>           }
>         }
>       `
>     }
>   >
>     {({
>       load,
>       loading,
>       fetchError,
>       httpError,
>       parseError,
>       graphQLErrors,
>       data
>     }) => (
>       <aside>
>         <button onClick={load} disabled={loading}>
>           Clap
>         </button>
>         {(fetchError || httpError || parseError || graphQLErrors) && (
>           <strong>Error!</strong>
>         )}
>         {data && <p>Clapped {data.clapArticle.clapCount} times.</p>}
>       </aside>
>     )}
>   </Query>
> )
> ```

### type ActiveQuery

Loading query details.

**Type:** [Object](https://mdn.io/object)

| Property           | Type                                                                     | Description                                                        |
| :----------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `fetchOptionsHash` | [string](https://mdn.io/string)                                          | [fetch options](#type-fetchoptions) hash.                          |
| `cache`            | [RequestCache](#type-requestcache)?                                      | Results from the last identical request.                           |
| `request`          | [Promise](https://mdn.io/promise)&lt;[RequestCache](#type-requestcache)> | A promise that resolves fresh [request cache](#type-requestcache). |

### type ConsumerRender

Renders a [`GraphQL`](#class-graphql) consumer.

**Type:** [function](https://mdn.io/function)

| Parameter | Type                      | Description                           |
| :-------- | :------------------------ | :------------------------------------ |
| `graphql` | [GraphQL](#class-graphql) | [`GraphQL`](#class-graphql) instance. |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_A button that resets the [GraphQL cache](#graphql-instance-property-cache)._

> ```jsx
> graphql => <button onClick={graphql.reset}>Reset cache</button>
> ```

### type FetchOptions

[Polyfillable fetch options](https://github.github.io/fetch/#options) for a GraphQL request.

**Type:** [Object](https://mdn.io/object)

| Property      | Type                                        | Description                      |
| :------------ | :------------------------------------------ | :------------------------------- |
| `url`         | [string](https://mdn.io/string)             | A GraphQL API URL.               |
| `body`        | [string](https://mdn.io/string) \| FormData | HTTP request body.               |
| `headers`     | [Object](https://mdn.io/object)             | HTTP request headers.            |
| `credentials` | [string](https://mdn.io/string)?            | Authentication credentials mode. |

### type FetchOptionsOverride

Overrides default GraphQL request [fetch options](#type-fetchoptions). Modify the provided options object without a return.

**Type:** [function](https://mdn.io/function)

| Parameter      | Type                                        | Description                            |
| :------------- | :------------------------------------------ | :------------------------------------- |
| `fetchOptions` | [FetchOptions](#type-fetchoptions)          | Default GraphQL request fetch options. |
| `operation`    | [GraphQLOperation](#type-graphqloperation)? | GraphQL operation.                     |

#### Examples

_Setting [fetch options](#type-fetchoptions) for an example API._

> ```js
> options => {
>   options.url = 'https://api.example.com/graphql'
>   options.credentials = 'include'
> }
> ```

### type GraphQLOperation

A GraphQL operation. Additional properties may be used; all are sent to the GraphQL server.

**Type:** [Object](https://mdn.io/object)

| Property    | Type                            | Description                   |
| :---------- | :------------------------------ | :---------------------------- |
| `query`     | [string](https://mdn.io/string) | GraphQL queries or mutations. |
| `variables` | [Object](https://mdn.io/object) | Variables used by the query.  |

### type HttpError

Fetch HTTP error.

**Type:** [Object](https://mdn.io/object)

| Property     | Type                            | Description       |
| :----------- | :------------------------------ | :---------------- |
| `status`     | [number](https://mdn.io/number) | HTTP status code. |
| `statusText` | [string](https://mdn.io/string) | HTTP status text. |

### type QueryRender

Renders the status of a query or mutation.

**Type:** [function](https://mdn.io/function)

| Parameter       | Type                                | Description                                |
| :-------------- | :---------------------------------- | :----------------------------------------- |
| `load`          | [function](https://mdn.io/function) | Loads the query on demand, updating cache. |
| `loading`       | [boolean](https://mdn.io/boolean)   | Is the query loading.                      |
| `fetchError`    | [string](https://mdn.io/string)?    | Fetch error message.                       |
| `httpError`     | [HttpError](#type-httperror)?       | Fetch response HTTP error.                 |
| `parseError`    | [string](https://mdn.io/string)?    | Parse error message.                       |
| `graphQLErrors` | [Object](https://mdn.io/object)?    | GraphQL response errors.                   |
| `data`          | [Object](https://mdn.io/object)?    | GraphQL response data.                     |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_Rendering a user profile query._

> ```jsx
> ;({
>   load,
>   loading,
>   fetchError,
>   httpError,
>   parseError,
>   graphQLErrors,
>   data
> }) => (
>   <aside>
>     <button onClick={load}>Reload</button>
>     {loading && <span>Loading…</span>}
>     {(fetchError || httpError || parseError || graphQLErrors) && (
>       <strong>Error!</strong>
>     )}
>     {data && <h1>{data.user.name}</h1>}
>   </aside>
> )
> ```

### type RequestCache

JSON serializable result of a GraphQL request (including all errors and data) suitable for caching.

**Type:** [Object](https://mdn.io/object)

| Property        | Type                             | Description                |
| :-------------- | :------------------------------- | :------------------------- |
| `fetchError`    | [string](https://mdn.io/string)? | Fetch error message.       |
| `httpError`     | [HttpError](#type-httperror)?    | Fetch response HTTP error. |
| `parseError`    | [string](https://mdn.io/string)? | Parse error message.       |
| `graphQLErrors` | [Object](https://mdn.io/object)? | GraphQL response errors.   |
| `data`          | [Object](https://mdn.io/object)? | GraphQL response data.     |
