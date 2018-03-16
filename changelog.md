# graphql-react changelog

## Next

* Updated dependencies.
* Remove `Promise` polyfill. For optimal bundle size consumers can handle it.
* Document required polyfills in the readme.
* Updated ESLint config:
  * `parserOptions` is unnecessary when using `babel-eslint`.
  * Enabled `prefer-destructuring` rule.

## 1.0.0-alpha.1

* Updated dependencies.
* Updated Node.js support to v7.6+.
* New `preload` API for server side rendering, fixing [#2](https://github.com/jaydenseric/graphql-react/issues/2).
* Renamed `GraphQLProvider` and `GraphQLConsumer` to `Provider` and `Consumer`.
* No longer exporting `GraphQLQuery`.
* Swapped the `GraphQLQuery` and `Query` names.
* Removed `GraphQLMutation` component; `GraphQLQuery` can be used for both queries and mutations.
* `GraphQLQuery` component `loadOnMount` and `loadOnReset` props now default to `false`:
  * Opt-in is safer for mutations.
  * Removing `static defaultProps` reduces bundle size.
  * Nicer valueless boolean props (`<GraphQLQuery />` and `<GraphQLQuery loadOnReset />` vs `<GraphQLQuery loadOnReset={false} />` and `<GraphQLQuery loadOnReset={true} />`.
* The `Query` component `resetOnLoad` prop doesn’t cause cache for the request that triggered a reset to delete, allowing simultaneous use with `loadOnReset`. Fixes [#3](https://github.com/jaydenseric/graphql-react/issues/3).
* The `GraphQL` `reset` instance method now accepts a fetch options hash to exempt a request from cache deletion.
* The `GraphQL` `query` instance method now accepts an options object.
* New approach to configuring GraphQL request fetch options:
  * Removed the `GraphQL` constructor `requestOptions` option.
  * The `Query` component now has a `fetchOptionsOverride` prop, allowing components to easily query any GraphQL API. Consumers may export an override function tailored for each API in one place to make things DRY.
  * The Next.js example app has been updated to demo the new API using the external [GraphQL Pokémon](https://github.com/lucasbento/graphql-pokemon) API.
* Fetch errors when a request could not be sent at all (e.g. a relative URL can’t be used for server side rendering) are uncaught instead of incorrectly cached as a `parseError`.
* Simplified the JSDoc script, now that [Documentation.js handles `.mjs`](https://github.com/documentationjs/documentation/pull/1023).
* Prevent lib or example updates from triggering tests in watch mode.
* Fixed the example setup script and made `graphql-react` a published dependency, via [#1](https://github.com/jaydenseric/graphql-react/pull/1).
* Commented GraphQL template literals for editor syntax highlighting.
* Configured [Travis](https://travis-ci.org/jaydenseric/graphql-react) and added a build status readme badge.
* Improved API documentation.

## 0.1.0

* Initial release.
