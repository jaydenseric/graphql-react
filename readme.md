![graphql-react logo](https://cdn.rawgit.com/jaydenseric/graphql-react/b2e60e80/graphql-react-logo.svg)

# graphql-react

[![Build status](https://travis-ci.org/jaydenseric/graphql-react.svg)](https://travis-ci.org/jaydenseric/graphql-react) [![npm version](https://img.shields.io/npm/v/graphql-react.svg)](https://npm.im/graphql-react)

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

Create and provide a [GraphQL](#graphql) client:

```jsx
import { GraphQL, Provider } from 'graphql-react'

const graphql = new GraphQL()

const Page = () => (
  <Provider value={graphql}>Use Consumer or Query components…</Provider>
)
```

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

- [type ConsumerRender](#type-consumerrender)
  - [Examples](#examples)
- [class GraphQLQuery](#class-graphqlquery)
  - [GraphQLQuery instance method load](#graphqlquery-instance-method-load)
- [function Query](#function-query)
  - [Examples](#examples-1)
- [type QueryRender](#type-queryrender)
  - [Examples](#examples-2)
- [type Operation](#type-operation)
- [type FetchOptions](#type-fetchoptions)
- [type FetchOptionsOverride](#type-fetchoptionsoverride)
  - [Examples](#examples-3)
- [type ActiveQuery](#type-activequery)
- [type RequestCache](#type-requestcache)
- [type HttpError](#type-httperror)
- [class GraphQL](#class-graphql)
  - [Examples](#examples-4)
  - [GraphQL instance property cache](#graphql-instance-property-cache)
    - [Examples](#examples-5)
  - [GraphQL instance method reset](#graphql-instance-method-reset)
    - [Examples](#examples-6)
  - [GraphQL instance method query](#graphql-instance-method-query)
- [function preload](#function-preload)
  - [Examples](#examples-7)

### type ConsumerRender

Renders a [`GraphQL`](#class-graphql) consumer.

**Type:** [function](https://developer.mozilla.org/javascript/reference/global_objects/function)

| Parameter | Type                      | Description                           |
| --------- | ------------------------- | ------------------------------------- |
| graphql   | [GraphQL](#class-graphql) | [`GraphQL`](#class-graphql) instance. |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

_A button that resets the [GraphQL cache](#graphql-instance-property-cache)._

> ```jsx
> graphql => <button onClick={graphql.reset}>Reset cache</button>
> ```

### class GraphQLQuery

A React component to manage a GraphQL query with a [`GraphQL`](#class-graphql) instance. See also the [`Query`](#function-query) component, which takes the [`GraphQL`](#class-graphql) instance from context instead of a prop.

| Parameter                  | Type                                                                                            | Description                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| props                      | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)              | Component props.                                                                                 |
| props.graphql              | [GraphQL](#class-graphql)                                                                       | [`GraphQL`](#class-graphql) instance.                                                            |
| props.variables            | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)?             | GraphQL query variables.                                                                         |
| props.query                | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)              | GraphQL query.                                                                                   |
| props.fetchOptionsOverride | [FetchOptionsOverride](#type-fetchoptionsoverride)?                                             | Overrides default fetch options for the GraphQL request.                                         |
| props.loadOnMount          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the query load when the component mounts.                                                 |
| props.loadOnReset          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the query load when its [GraphQL cache](#graphql-instance-property-cache) entry is reset. |
| props.resetOnLoad          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should all other [GraphQL cache](#graphql-instance-property-cache) reset when the query loads.   |
| props.children             | [QueryRender](#type-queryrender)                                                                | Renders the query status.                                                                        |

#### GraphQLQuery instance method load

Loads the query, updating cache.

**Returns:** RequestCachePromise — A promise that resolves the [request cache](#type-requestcache).

### function Query

A React component to manage a GraphQL query or mutation.

| Parameter                  | Type                                                                                            | Description                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| props                      | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)              | Component props.                                                                           |
| props.variables            | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)?             | GraphQL query variables.                                                                   |
| props.query                | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)              | GraphQL query.                                                                             |
| props.fetchOptionsOverride | [FetchOptionsOverride](#type-fetchoptionsoverride)?                                             | Overrides default GraphQL request [fetch options](#type-fetchoptions).                     |
| props.loadOnMount          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the query load when the component mounts.                                           |
| props.loadOnReset          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the query load when the [GraphQL cache](#graphql-instance-property-cache) is reset. |
| props.resetOnLoad          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the [GraphQL cache](#graphql-instance-property-cache) reset when the query loads.   |
| props.children             | [QueryRender](#type-queryrender)                                                                | Renders the query status.                                                                  |

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
>       options.url = 'https://api.example.com/graphql'
>     }}
>     variables={{ userId }}
>     query={`
>       query user($userId: ID!) {
>         user(userId: $id) {
>           name
>         }
>       }
>     `}
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
>     variables={{ articleId }}
>     query={`
>       mutation clapArticle($articleId: ID!) {
>         clapArticle(articleId: $id) {
>           clapCount
>         }
>       }
>     `}
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

### type QueryRender

Renders the status of a query or mutation.

**Type:** [function](https://developer.mozilla.org/javascript/reference/global_objects/function)

| Parameter     | Type                                                                                   | Description                                |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| load          | [function](https://developer.mozilla.org/javascript/reference/global_objects/function) | Loads the query on demand, updating cache. |
| loading       | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)   | Is the query loading.                      |
| fetchError    | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)?    | Fetch error message.                       |
| httpError     | [HttpError](#type-httperror)?                                                          | Fetch response HTTP error.                 |
| parseError    | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)?    | Parse error message.                       |
| graphQLErrors | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)?    | GraphQL response errors.                   |
| data          | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)?    | GraphQL response data.                     |

**Returns:** ReactElement — React virtual DOM element.

#### Examples

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

### type Operation

A GraphQL operation object. Additional properties may be used; all are sent to the GraphQL server.

**Type:** [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)

| Property  | Type                                                                               | Description                   |
| --------- | ---------------------------------------------------------------------------------- | ----------------------------- |
| query     | [string](https://developer.mozilla.org/javascript/reference/global_objects/string) | GraphQL queries or mutations. |
| variables | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object) | Variables used by the query.  |

### type FetchOptions

[Polyfillable fetch options](https://github.github.io/fetch/#options) for a GraphQL request.

**Type:** [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)

| Property    | Type                                                                                           | Description                      |
| ----------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| url         | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)             | A GraphQL API URL.               |
| body        | [string](https://developer.mozilla.org/javascript/reference/global_objects/string) \| FormData | HTTP request body.               |
| headers     | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)             | HTTP request headers.            |
| credentials | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)?            | Authentication credentials mode. |

### type FetchOptionsOverride

Overrides default GraphQL request [fetch options](#type-fetchoptions). Modify the provided options object without a return.

**Type:** [function](https://developer.mozilla.org/javascript/reference/global_objects/function)

| Parameter    | Type                               | Description                            |
| ------------ | ---------------------------------- | -------------------------------------- |
| fetchOptions | [FetchOptions](#type-fetchoptions) | Default GraphQL request fetch options. |
| operation    | [Operation](#type-operation)?      | A GraphQL operation object.            |

#### Examples

> ```js
> options => {
>   options.url = 'https://api.example.com/graphql'
>   options.credentials = 'include'
> }
> ```

### type ActiveQuery

Loading query details.

**Type:** [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)

| Property         | Type                                                                               | Description                                                        |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| fetchOptionsHash | [string](https://developer.mozilla.org/javascript/reference/global_objects/string) | [fetch options](#type-fetchoptions) hash.                          |
| cache            | [RequestCache](#type-requestcache)?                                                | Results from the last identical request.                           |
| request          | Promise&lt;[RequestCache](#type-requestcache)>                                     | A promise that resolves fresh [request cache](#type-requestcache). |

### type RequestCache

JSON serializable result of a GraphQL request (including all errors and data) suitable for caching.

**Type:** [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)

| Property      | Type                                                                                | Description                |
| ------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| fetchError    | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)? | Fetch error message.       |
| httpError     | [HttpError](#type-httperror)?                                                       | Fetch response HTTP error. |
| parseError    | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)? | Parse error message.       |
| graphQLErrors | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)? | GraphQL response errors.   |
| data          | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)? | GraphQL response data.     |

### type HttpError

Fetch HTTP error.

**Type:** [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)

| Property   | Type                                                                               | Description       |
| ---------- | ---------------------------------------------------------------------------------- | ----------------- |
| status     | [number](https://developer.mozilla.org/javascript/reference/global_objects/number) | HTTP status code. |
| statusText | [string](https://developer.mozilla.org/javascript/reference/global_objects/string) | HTTP status text. |

### class GraphQL

A lightweight GraphQL client that caches requests.

| Parameter     | Type                                                                                       | Description                                         |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| options       | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)? = `{}` | Options.                                            |
| options.cache | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)? = `{}` | Cache to import; usually from a server side render. |

#### Examples

> ```js
> import { GraphQL } from 'graphql-react'
>
> const graphql = new GraphQL()
> ```

#### GraphQL instance property cache

GraphQL [request cache](#type-requestcache) map, keyed by [fetch options](#type-fetchoptions) hashes.

##### Examples

_Export cache as JSON._

> ```js
> const exportedCache = JSON.stringify(graphql.cache)
> ```

#### GraphQL instance method reset

Resets the [GraphQL cache](#graphql-instance-property-cache). Useful when a user logs out.

| Parameter              | Type                                                                                | Description                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| exceptFetchOptionsHash | [string](https://developer.mozilla.org/javascript/reference/global_objects/string)? | A [fetch options](#type-fetchoptions) hash to exempt a request from cache deletion. Useful for resetting cache after a mutation, preserving the mutation cache. |

##### Examples

> ```js
> graphql.reset()
> ```

#### GraphQL instance method query

Queries a GraphQL server.

| Parameter                    | Type                                                                                            | Description                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| options                      | [Object](https://developer.mozilla.org/javascript/reference/global_objects/object)              | Options.                                                                                 |
| options.operation            | [Operation](#type-operation)                                                                    | GraphQL operation object.                                                                |
| options.fetchOptionsOverride | [FetchOptionsOverride](#type-fetchoptionsoverride)?                                             | Overrides default GraphQL request [fetch options](#type-fetchoptions).                   |
| options.resetOnLoad          | [boolean](https://developer.mozilla.org/javascript/reference/global_objects/boolean)? = `false` | Should the [GraphQL cache](#graphql-instance-property-cache) reset when the query loads. |

**Returns:** [ActiveQuery](#type-activequery) — Loading query details.

### function preload

Recursively preloads [`Query`](#function-query) components that have the `loadOnMount` prop in a React element tree. Useful for server side rendering (SSR) or to preload components for a better user experience when they mount.

| Parameter | Type         | Description                  |
| --------- | ------------ | ---------------------------- |
| element   | ReactElement | A React virtual DOM element. |

**Returns:** Promise — Resolves once loading is done and cache is ready to be exported from the [`GraphQL`](#class-graphql) instance. Cache can be imported when constructing new [`GraphQL`](#class-graphql) instances.

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
