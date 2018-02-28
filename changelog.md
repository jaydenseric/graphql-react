# graphql-react changelog

## Next

* Updated dependencies.
* Updated Node.js support to v7.6+.
* Fixed the example setup script and made `graphql-react` a published dependency, via [#1](https://github.com/jaydenseric/graphql-react/pull/1).
* Configured [Travis](https://travis-ci.org/jaydenseric/graphql-react).
* Added Travis build status readme badge.
* Renamed `GraphQLProvider` and `GraphQLConsumer` to `Provider` and `Consumer`.
* No longer exporting `GraphQLQuery`.
* Swapped the `GraphQLQuery` and `Query` names.
* Removed `GraphQLMutation` component; `GraphQLQuery` can be used for both queries and mutations.
* `GraphQLQuery` component `loadOnMount` and `loadOnReset` props now default to `false`:
  * Opt-in is safer for mutations.
  * Removing `static defaultProps` reduces bundle size.
  * Nicer valueless boolean props (`<GraphQLQuery />` and `<GraphQLQuery loadOnReset />` vs `<GraphQLQuery loadOnReset={false} />` and `<GraphQLQuery loadOnReset={true} />`.
* Commented GraphQL template literals for editor syntax highlighting.
* Improved API documentation.

## 0.1.0

* Initial release.
