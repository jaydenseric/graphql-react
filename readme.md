![graphql-react logo](https://cdn.jsdelivr.net/gh/jaydenseric/graphql-react@0.1.0/graphql-react-logo.svg)

# graphql-react

[![npm version](https://badgen.net/npm/v/graphql-react)](https://npm.im/graphql-react) [![Build status](https://travis-ci.org/jaydenseric/graphql-react.svg?branch=master)](https://travis-ci.org/jaydenseric/graphql-react)

A lightweight GraphQL client for React; the first Relay and Apollo alternative with server side rendering.

### Easy 🔥

- Add 1 dependency to a React project to get started.
- No [webpack](https://webpack.js.org) or [Babel](https://babeljs.io) setup.
- Write queries without [`gql`](https://github.com/apollographql/graphql-tag#gql).
- Use file input values as mutation arguments to upload files; [compatible with a variety of servers](https://github.com/jaydenseric/graphql-multipart-request-spec#server).
- Automatically fresh cache, even after mutations.

### Smart 💡

- &lt; 2.5 KB min+gzip bundle size, guaranteed by [`size-limit`](https://npm.im/size-limit) tests. That’s around 40 KB less than [Apollo](https://www.apollographql.com)!
- Native ESM via `.mjs` for [Node.js in `--experimental-modules` mode](https://nodejs.org/api/esm.html#esm_enabling) and [tree shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking) bundlers like [webpack](https://webpack.js.org).
- Server side rendering for better UX and SEO.
- Uses the [React v16.3 context API](https://github.com/facebook/react/pull/11818).
- All fetch options overridable per request.
- GraphQL requests are cached under hashes of their `fetch` options:
  - No data normalization or need to query `id` fields.
  - No tampering with queries or `__typename` insertion.
  - Errors cache and can be server side rendered.
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
    operation={{
      variables: { name },
      query: /* GraphQL */ `
        query pokemon($name: String!) {
          pokemon(name: $name) {
            number
            image
          }
        }
      `
    }}
  >
    {({ loading, data }) =>
      data ? (
        <figure>
          <img src={data.pokemon.image} alt={name} />
          <figcaption>
            Pokémon #{data.pokemon.number}: {name}
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

## Examples

- [The official Next.js example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react).
- [The Next.js example](https://github.com/jaydenseric/graphql-react-examples) deployed at [graphql-react.now.sh](https://graphql-react.now.sh).

## Support

- Node.js v8.5+
- Browsers [`> 0.5%, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+dead)

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
  - [GraphQL instance property logErrors](#graphql-instance-property-logerrors)
- [function Consumer](#function-consumer)
  - [Examples](#examples-3)
- [function Provider](#function-provider)
  - [Examples](#examples-4)
- [function Query](#function-query)
  - [Examples](#examples-5)
- [function ssr](#function-ssr)
  - [See](#see)
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
- [type ReactNode](#type-reactnode)
- [type RequestCache](#type-requestcache)

### class GraphQL

A lightweight GraphQL client that caches requests.

| Parameter           | Type                                        | Description                                                         |
| :------------------ | :------------------------------------------ | :------------------------------------------------------------------ |
| `options`           | [Object](https://mdn.io/object)? = `{}`     | Options.                                                            |
| `options.cache`     | [Object](https://mdn.io/object)? = `{}`     | Cache to import; usually from a server side render.                 |
| `options.logErrors` | [boolean](https://mdn.io/boolean)? = `true` | Should GraphQL request errors be console logged for easy debugging. |

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

#### GraphQL instance property logErrors

Should GraphQL request errors be logged. May be toggled at runtime.

### function Consumer

A React component that gets the [`GraphQL`](#class-graphql) instance from context.

| Parameter  | Type                                   | Description                                                           |
| :--------- | :------------------------------------- | :-------------------------------------------------------------------- |
| `children` | [ConsumerRender](#type-consumerrender) | Render function that receives a [`GraphQL`](#class-graphql) instance. |

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

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

### function Provider

A React component that provides a [`GraphQL`](#class-graphql) instance in context for nested [`Consumer`](#function-consumer) components to use.

| Parameter  | Type                         | Description                             |
| :--------- | :--------------------------- | :-------------------------------------- |
| `value`    | [GraphQL](#class-graphql)    | A [`GraphQL`](#class-graphql) instance. |
| `children` | [ReactNode](#type-reactnode) | A React node.                           |

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

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

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

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

### function ssr

Asynchronously server side renders a [React node](#type-reactnode), preloading all [`Query`](#function-query) components that have the `loadOnMount` prop. After resolving, cache can be exported from the [`GraphQL` instance property `cache`](#graphql-instance-property-cache) for serialization (usually as JSON) and transport to the client for hydration via the [`GraphQL` constructor parameter `options.cache`](#class-graphql).

| Parameter | Type                                                                         | Description                                                                                                                                                                                                                                                                                              |
| :-------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `graphql` | [GraphQL](#class-graphql)                                                    | [`GraphQL`](#class-graphql) instance.                                                                                                                                                                                                                                                                    |
| `node`    | [ReactNode](#type-reactnode)                                                 | React virtual DOM node.                                                                                                                                                                                                                                                                                  |
| `render`  | [function](https://mdn.io/function)? = `ReactDOMServer.renderToStaticMarkup` | Synchronous React server side render function, defaulting to [`ReactDOMServer.renderToStaticMarkup`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) as it is more efficient than [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring). |

**Returns:** [Promise](https://mdn.io/promise)&lt;[string](https://mdn.io/string)> — Promise resolving the rendered HTML string.

#### See

- [`ReactDOMServer` docs](https://reactjs.org/docs/react-dom-server).
- [`next-graphql-react`](https://npm.im/next-graphql-react) makes it easy to use this API in a [Next.js](https://nextjs.org) project.

#### Examples

_SSR function that resolves a HTML string and cache JSON for client hydration._

> ```jsx
> import { GraphQL, Provider } from 'graphql-react'
> import { ssr } from 'graphql-react/lib/ssr'
> import ReactDOMServer from 'react-dom/server'
> import { App } from './components'
>
> async function render() {
>   const graphql = new GraphQL()
>   const page = (
>     <Provider value={graphql}>
>       <App />
>     </Provider>
>   )
>   const html = await ssr(graphql, page, ReactDOMServer.renderToString)
>   const cache = JSON.stringify(graphql.cache)
>   return { html, cache }
> }
> ```

_SSR function that resolves a HTML string suitable for a static page._

> ```jsx
> import { GraphQL, Provider } from 'graphql-react'
> import { ssr } from 'graphql-react/lib/ssr'
> import { App } from './components'
>
> function render() {
>   const graphql = new GraphQL()
>   const page = (
>     <Provider value={graphql}>
>       <App />
>     </Provider>
>   )
>   return ssr(graphql, page)
> }
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

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

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

| Parameter       | Type                                                               | Description                                |
| :-------------- | :----------------------------------------------------------------- | :----------------------------------------- |
| `load`          | [function](https://mdn.io/function)                                | Loads the query on demand, updating cache. |
| `loading`       | [boolean](https://mdn.io/boolean)                                  | Is the query loading.                      |
| `fetchError`    | [string](https://mdn.io/string)?                                   | Fetch error message.                       |
| `httpError`     | [HttpError](#type-httperror)?                                      | Fetch response HTTP error.                 |
| `parseError`    | [string](https://mdn.io/string)?                                   | Parse error message.                       |
| `graphQLErrors` | [Array](https://mdn.io/array)&lt;[Object](https://mdn.io/object)>? | GraphQL response errors.                   |
| `data`          | [Object](https://mdn.io/object)?                                   | GraphQL response data.                     |

**Returns:** [ReactNode](#type-reactnode) — React virtual DOM node.

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

### type ReactNode

React virtual DOM node; anything React can render.

**Type:** undefined | null | [boolean](https://mdn.io/boolean) | [number](https://mdn.io/number) | [string](https://mdn.io/string) | React.Element | [Array](https://mdn.io/array)&lt;[ReactNode](#type-reactnode)>

### type RequestCache

JSON serializable result of a GraphQL request (including all errors and data) suitable for caching.

**Type:** [Object](https://mdn.io/object)

| Property        | Type                                                               | Description                |
| :-------------- | :----------------------------------------------------------------- | :------------------------- |
| `fetchError`    | [string](https://mdn.io/string)?                                   | Fetch error message.       |
| `httpError`     | [HttpError](#type-httperror)?                                      | Fetch response HTTP error. |
| `parseError`    | [string](https://mdn.io/string)?                                   | Parse error message.       |
| `graphQLErrors` | [Array](https://mdn.io/array)&lt;[Object](https://mdn.io/object)>? | GraphQL response errors.   |
| `data`          | [Object](https://mdn.io/object)?                                   | GraphQL response data.     |
