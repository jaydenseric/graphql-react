# graphql-react changelog

## Next

* Updated dependencies.
* Fixed accidental distribution code Prettier ignoring.
* Replaced `ava` with `node-tap` for testing. Tests don't require a special CLI, no longer transpile on the fly, are faster and AVA no longer dictates the Babel version.
* Tests run against the actual dist `.mjs` and `.js` files in native ESM (`--experimental-modules`) and CJS environments.
* Updated Babel config:
  * Use `babel.config.js` instead of `.babelrc.js`.
  * Renamed the `ESM` environment variable to `BABEL_ESM` to be more specific.
* Improved `package.json` scripts:
  * Leveraged `npm-run-all` more for parallelism and reduced noise.
  * Removed linting fix scripts.
  * Linting included in the `test` script. Travis CI will fail PR's with lint errors.
  * Custom watch script.
  * No longer use `cross-env`; contributors with Windows may setup and use a Bash shell.
* Improved ESLint config:
  * Use the right `sourceType` for `.js` (`script`) and `.mjs` (`module`) files.
  * Removed redundant `eslint-plugin-ava` dev dependency and config.
  * Use `eslint-plugin-import` and `eslint-plugin-node` and enable more rules.
  * Undo overriding ESLint ignoring dotfiles by default as there are none now.
* Moved the example project to [a separate repo](https://github.com/jaydenseric/graphql-react-examples).

## 1.0.0

* Updated dependencies.
* Pinned `@babel` dev dependencies to match new AVA requirements.
* Use [`eslint-config-prettier`](https://npm.im/eslint-config-prettier).
* Capitalized the fetch options `Accept` header for display consistency in tools such as the Chrome network inspector and to better support case-sensitive systems, even though HTTP headers are supposed to be case-insensitive.
* Readme example link goes to the example project directory instead of the readme file.
* Test and example updates:
  * Use [`fake-tag`](https://npm.im/fake-tag) for GraphQL template literals due to [prettier/prettier#4360](https://github.com/prettier/prettier/issues/4360).
  * Use [`express`](https://npm.im/express) instead of Koa packages.
  * Use [`express-graphql`](https://npm.im/express-graphql) instead of Apollo packages.
* Test updates:
  * Removed [`apollo-upload-server`](https://npm.im/apollo-upload-server) as there are no upload tests yet.
  * Removed [`get-port`](https://npm.im/get-port) as not providing a port to `app.listen` has the same effect.
* Example updates:
  * Stop using [`esm`](https://npm.im/esm) due to [graphql/express-graphql#425](https://github.com/graphql/express-graphql/issues/425).
  * Enabled GraphiQL and added a link to it on the homepage.

## 1.0.0-alpha.5

* Updated dependencies.
* Updated the `react` peer dependency to `^16.3.1`.
* Fixed `preload` broken due to the [React v16.3.1](https://github.com/facebook/react/releases/tag/v16.3.1) [context API change](https://github.com/facebook/react/pull/12501).
* Example updates:
  * Valid length app manifest `short_name`.
  * Added `<html>` `lang` attribute.
  * Added Twitter card meta tags.

## 1.0.0-alpha.4

* Updated dependencies.
* Replaced [`isomorphic-unfetch`](https://npm.im/isomorphic-unfetch) with the more updated [`cross-fetch`](https://npm.im/cross-fetch).
* Added a `fetchError` `Query` render function argument, enabling graceful caching and handling of errors in situations such as when a global `fetch` API is unavailable or a relative URL is used on the sever.
* Use `.prettierignore` to defer `package.json` formatting to npm.
* Improved the example web app and deployed it to [graphql-react.now.sh](https://graphql-react.now.sh).

## 1.0.0-alpha.3

* Support the legacy React context API, fixing [#7](https://github.com/jaydenseric/graphql-react/issues/7).
* Use [`eslint-plugin-ava`](https://npm.im/eslint-plugin-ava).

## 1.0.0-alpha.2

* Updated dependencies.
* Significantly reduced the bundle size to < 4 KB by simplifying Babel helpers and reusing the [`object-assign`](https://npm.im/object-assign) React dependency with [`babel-plugin-transform-replace-object-assign`](https://npm.im/babel-plugin-transform-replace-object-assign).
* Removed the `Promise` polyfill; consumers can polyfill as required for optimal bundle size.
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
