# graphql-react changelog

## 8.3.0

### Minor

- Added a `response` property to the `GraphQL` instance `cache` event payload, containing the original `fetch` [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance the `cacheValue` was derived from.

### Patch

- Updated dependencies.
- Increased the post SSR hydration time from 500 to 1000 milliseconds, closing [#37](https://github.com/jaydenseric/graphql-react/issues/37).
- Added a `useGraphQL` options guide for common situations.
- Test `GraphQL.operate()` with both `reloadOnLoad` and `resetOnLoad` options true.
- Use string `FormData` field names, as some `FormData` polyfills don't coerce numbers like native implementations do.
- Test files in variables result in appropriate fetch options for a valid [GraphQL multipart request](https://github.com/jaydenseric/graphql-multipart-request-spec).
- Tidied test names.
- Nicer Browserslist syntax for supported Node.js versions.

## 8.2.0

### Minor

- Added a new `GraphQLProvider` component that prevents unnecessary loading on the client after SSR, fixing [#4](https://github.com/jaydenseric/graphql-react/issues/4). This component should be used instead of using `GraphQLContext.Provider` directly. The old way still works, but with the old behavior.

### Patch

- Updated dev dependencies.
- Updated the `GraphQLContext.Consumer` example to use React hooks.

## 8.1.3

### Patch

- Updated dependencies.
- Adopted the new [`size-limit`](https://npm.im/size-limit) config file name.
- Slightly faster `useGraphQL` render error when options `reloadOnLoad` and `resetOnLoad` are both `true`.
- Use a ref instead of a variable in `useGraphQL` to track mounted status for cache related callbacks.
- Document the `GraphQL` instance method `operate` option `reloadOnLoad`.
- Minor readme quotes consistency tweak.

## 8.1.2

### Patch

- Updated dependencies.
- Updated `useGraphQL` to use `useCallback` and added hook dependency arrays, to fix a recently appearing `react-hooks/exhaustive-deps` lint error and hopefully reduce render work.
- Reduced the size of the published `package.json` by moving dev tool config to files. This also prevents editor extensions such as Prettier and ESLint from detecting config and attempting to operate when opening package files installed in `node_modules`.
- Discuss Apollo Client fragment matcher config in the “Apollo comparison” readme section.

## 8.1.1

### Patch

- Updated a dev dependency.
- Removed redundant `useGraphQL` internal `useEffect` React hook second arguments.
- Fixed “Can't perform a React state update on an unmounted component” warnings if the component using the `useGraphQL` React hook is unmounted soon after an `GraphQL` instance event such as `reset` is emitted.

## 8.1.0

### Minor

- Added the `GraphQL` instance method `reload` which fires a `reload` event signaling that GraphQL cache subscribers such as the `useGraphQL` React hook should reload their GraphQL operation, fixing [#26](https://github.com/jaydenseric/graphql-react/issues/26).
- Added the `useGraphQL` React hook `reloadOnLoad` option.

### Patch

- Updated dependencies.
- More reliable `useGraphQL` React hook `loadOnMount` option implementation that fixes ESLint `react-hooks/exhaustive-deps` rule errors.
- Use `function` instead of `const` declarations in places to simplify transpiled output.
- `GraphQL.reset()` test name typo fix.
- Added tests for the `useGraphQL` React hook `reloadOnLoad` and `resetOnLoad` options.
- Increased the browser bundle size limit to 2.5 KB as the new features grew the bundle size from ~1.95 KB to ~2.13 KB.
- Improved `GraphQL` instance event documentation.

## 8.0.2

### Patch

- Updated dev dependencies.
- `useGraphQL` React hook bug fix for when arguments change after the initial render and the `load` function is called: `loading` and `cacheValue` now update correctly after the operation loads.

## 8.0.1

### Patch

- Updated dev dependencies.
- `useGraphQL` React hook bug fixes for when arguments change after the initial render:
  - Changes that cause the `cacheKey` to change trigger a reload if the `loadOnMount` option is `true`, fixing [#23](https://github.com/jaydenseric/graphql-react/issues/23).
  - Fixed stale operation status properties being returned.
- Use [`react-test-renderer`](https://npm.im/react-test-renderer) to test `useGraphQL` with a lot more detail.
- Capitalized the `React` namespace in `useGraphQL`.
- Improved `hashObject()` tests.

## 8.0.0

### Major

- Updated the [`react`](https://npm.im/react) and [`react-dom`](https://npm.im/react-dom) peer dependencies to `^16.8.0`.
- Removed the `Query` component.
- No longer exporting `Provider` and `Consumer`; now `GraphQLContext` is exported.
- The `GraphQL` instance method `query` has been renamed `operate`.
- The `GraphQL` constructor no longer has the `logErrors` option, and GraphQL operation errors are no longer console logged by default.
- The `ssr` function is now exported from `graphql-react/server` instead of `graphql-react/lib/ssr`.
- The `ssr` function is now implemented using `async`/`await` syntax.
- Browser (and less commonly server) environments that fetch GraphQL operations with file uploads must now support (natively or by polyfill) the [`FormData.entries()`](https://developer.mozilla.org/docs/Web/API/FormData/entries) API.

  Caching of [GraphQL multipart requests](https://github.com/jaydenseric/graphql-multipart-request-spec) when the `fetch` options `body` is a `FormData` instance has been improved. Previously they would overwrite each other in the cache even if the GraphQL operations were different, depending if the `FormData` instance was native or from a polyfill that could be JSON serialized.

  There is still room to improve as `FormData` field values that are `File` or `Blob` instances don’t influence the cache key hashing.

- `GraphQL` event properties have been renamed or added:
  - The `fetch` event property `fetchOptionsHash` was renamed `cacheKey`, and the property `cache` was renamed `cacheValuePromise`.
  - The `cache` event property `fetchOptionsHash` was renamed `cacheKey`, and the property `cacheValue` was added.
  - The `reset` event property `exceptFetchOptionsHash` was renamed `exceptCacheKey`.

### Minor

- Added the `useGraphQL` React hook, which assumes the role of the removed `Query` component.
- Documented the `GraphQL` `on` and `off` methods for managing event listeners.
- Added the `reportCacheErrors` function, a `GraphQL` `cache` event handler that can be setup to report GraphQL operation errors via `console.log()`.

### Patch

- Updated dev dependencies.
- Updated the package description and keywords.
- Simplified the `prepublishOnly` script.
- Use the [`tap`](https://npm.im/tap) CLI and default reporter for tests.
- New project directory structure.
- Separate Babel configs for optimal universal, server, and test environment code.
- Much improved tests.
- Run size limit tests last in the package `test` script as they are the slowest.
- Smaller package size limits for server (3 KB down to 2.5 KB) and browser (2.5 KB down to 2 KB) environments.
- Improved JSDoc types and API documentation.
- Updated the readme intro and added a new “Apollo comparison” section.

## 7.0.0

### Major

- Removed the `preload` function. It was not going to work with React hooks.
- Added the [`react-dom`](https://npm.im/react-dom) peer dependency.
- Reorganized file structure. This is only a breaking change for consumers that were not importing the documented way (via the `main` package entry).

### Minor

- Added a `ssr` function, which is for server use only and is React hooks ready. It is simpler and more future-proof than the removed `preload` function as it leverages [`ReactDOMServer`](https://reactjs.org/docs/react-dom-server) for rendering.
- `GraphQL` now emits a `cache` promise in the `fetch` event payload. These events are undocumented, so this could be considered an internal change.

### Patch

- Updated dependencies.
- Handle exceptions outside tests (see [tapjs/node-tap#463 (comment)](https://github.com/tapjs/node-tap/issues/463#issuecomment-456701261)).
- Added a `ReactNode` JSDoc type, replacing `ReactElement` types.
- Removed tests made redundant by the removal of the `preload` function.
- Document [the official Next.js example](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-react).
- Improved documentation.

## 6.0.1

### Patch

- Updated dev dependencies.
- Removed the [`watch`](https://npm.im/watch) dev dependency and `watch` package script.
- `preload` now properly catches render errors nested under `Query` components.
- `preload` now supports class components that don’t call their base constructor with `props`, fixing [#17](https://github.com/jaydenseric/graphql-react/issues/17).
- Fixed a prop type warning in one of the tests.
- Fixed example code typos in the readme “Usage” section.
- Fixed incorrect `graphQLErrors` JSDoc type.

## 6.0.0

### Major

- Made `preload` reject upon render errors instead of throwing.

### Minor

- Made `Query` component throw a helpful render error if the GraphQL context is missing.

### Patch

- Updated dev dependencies.
- Improved [`size-limit`](https://npm.im/size-limit) tests:
  - Drop the CJS entrypoint; modern bundlers don’t use it and nested module imports revert resolve ESM anyway.
  - Ignore [`prop-types`](https://npm.im/prop-types) since it’s likely to already be present in a React project, and most frameworks strip it out in production bundles anyway.
  - Separately limit and test server and client bundles.

## 5.0.0

### Major

- Updated the [`extract-files`](https://npm.im/extract-files) dependency to v5:
  - The original operation object is no longer modified when it contains files.
  - If the same file is used in multiple locations of an operation it is only uploaded once.

### Patch

- Updated dependencies.
- Removed a redundant `.prettierignore` entry.
- Added tests for the internal `graphqlFetchOptions` function.

## 4.2.0

### Minor

- Added a new `GraphQL` constructor option `logErrors` (default `true`) and instance property, controlling if GraphQL request errors should be console logged for easy debugging.

### Patch

- Updated dependencies.
- Refactored `GraphQL` static methods to separate modules.
- Moved JSDoc type definitions into the index file.
- Manually composed package exports instead of relying on `*`.
- More consistent object snapshots in tests.

## 4.1.0

### Minor

- Support more browsers by changing the [Browserslist](https://github.com/browserslist/browserslist) query from [`> 1%`](https://browserl.ist/?q=%3E+1%25) to [`> 0.5%, not dead`](https://browserl.ist/?q=%3E+0.5%25%2C+not+dead).

### Patch

- Updated dependencies.
- Fix Babel not reading from the package `browserslist` field due to [a sneaky `@babel/preset-env` breaking change](https://github.com/babel/babel/pull/8509).
- Add back the bundle size test accidentally removed in v4.0.1.

## 4.0.1

### Patch

- Fixed `preload` for `production` `NODE_ENV`, fixing [#11](https://github.com/jaydenseric/graphql-react/issues/11) and [#12](https://github.com/jaydenseric/graphql-react/issues/12).
- `preload` now scopes context under providers.
- Removed redundant uses of `this` in the internal `GraphQLQuery` component constructor.
- Test the library with undefined and `production` `NODE_ENV`.

## 4.0.0

### Major

- Updated the `react` peer dependency to `^16.6.0`.
- Fixed `preload` broken due to the [React v16.6.0](https://github.com/facebook/react/releases/tag/v16.6.0) [context API change](https://github.com/facebook/react/pull/13829), fixing [#11](https://github.com/jaydenseric/graphql-react/issues/11).

### Patch

- Updated dev dependencies.

## 3.0.0

### Major

- The `Query` (and the internal `GraphQLQuery`) component take an `operation` prop instead of separate `variables` and `query` props. This makes the implementation a little more elegant, is more consistent with the `GraphQL.query` API and allows sending custom GraphQL operation fields.
- New internal event system, fixing [#10](https://github.com/jaydenseric/graphql-react/issues/10). Now the `loading` parameter of `Query` component render functions change when identical requests are loaded elsewhere in the app.

### Minor

- Improved `Provider` and `Consumer` component display names in React dev tools:
  - `Context.Provider` → `GraphQLContext.Provider`
  - `Context.Consumer` → `GraphQLContext.Consumer`

### Patch

- Updated dependencies.
- Updated package scripts and config for the new [`husky`](https://npm.im/husky) version.
- Removed the package `module` field. By default webpack resolves extensionless paths the same way Node.js in `--experimental-modules` mode does; `.mjs` files are preferred. Tools misconfigured or unable to resolve `.mjs` can get confused when `module` points to an `.mjs` ESM file and they attempt to resolve named imports from `.js` CJS files.
- Renamed the `Operation` type `GraphQLOperation`.
- Use [jsDelivr](https://jsdelivr.com) for the readme logo instead of [RawGit](https://rawgit.com) as they are shutting down.

## 2.0.1

### Patch

- Updated dependencies.
- Remove the `GraphQLQuery` component from API documentation as it used internally and is not exported.
- Regenerated the readme API docs using the latest [`jsdoc-md`](https://npm.im/jsdoc-md) version.
- Added a new “Usage” readme section.
- Fixed a link in the readme.
- Fixed example GraphQL query typos.

## 2.0.0

### Major

- Updated Node.js support from v7.6+ to v8.5+.

### Minor

- Use package `prepare` script to support installation via Git (e.g. `npm install jaydenseric/graphql-react`).
- Use [`@babel/plugin-transform-runtime`](https://npm.im/@babel/plugin-transform-runtime) and [`@babel/runtime`](https://npm.im/@babel/runtime) to make runtime helpers more DRY. Bundle size savings will manifest once more packages import the same helpers.
- Package [marked side-effect free](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) for bundlers and tree-shaking.

### Patch

- Updated dependencies.
- Removed the `rimraf` dev dependency in favour of a native `rm -rf` package clean script. Leaner and faster; we only support \*nix for contributing anyway.
- Fixed new Prettier lint errors and removed the `fake-tag` dev dependency now that Prettier can format template literals tagged with `/* GraphQL */`.
- Stopped using [`npm-run-all`](https://npm.im/npm-run-all) for package scripts to reduce complexity and bugs.
- Compact package `repository` field.
- Added more package tags.
- Lint `.yml` files.
- Test with [`graphql-api-koa`](https://npm.im/graphql-api-koa) instead of [`express-graphql`](https://npm.im/express-graphql).
- Fixed test snapshot consistency between Node.js versions (see [tapjs/node-tap#450](https://github.com/tapjs/node-tap/issues/450)).
- Use [`jsdoc-md`](https://npm.im/jsdoc-md) instead of [`documentation`](https://npm.im/documentation) to generate readme API docs.
- JSDoc fixes and improvements.
- Readme badge changes to deal with [shields.io](https://shields.io) unreliability:
  - Used the more reliable build status badge provided by Travis, configured to only track `master` branch.
  - Removed the licence badge. The licence can be found in `package.json` and rarely changes.
  - Removed the Github issues and stars badges. The readme is most viewed on Github anyway.
  - Use [Badgen](https://badgen.net) for the npm version badge.

## 1.0.1

### Patch

- Updated dependencies.
- Fixed accidental distribution code Prettier ignoring.
- Replaced `ava` with `tap` for testing. Tests don't require a special CLI, no longer transpile on the fly, are faster and AVA no longer dictates the Babel version.
- Tests run against the actual dist `.mjs` and `.js` files in native ESM (`--experimental-modules`) and CJS environments.
- Ignore [`object-assign`](https://npm.im/object-assign) for bundle size tests as it’s a React dependency and tighten the allowed bundle size from 4 KB to 3 KB.
- Updated Babel config:
  - Use `babel.config.js` instead of `.babelrc.js`.
  - Renamed the `ESM` environment variable to `BABEL_ESM` to be more specific.
- Improved `package.json` scripts:
  - Leveraged [`npm-run-all`](https://npm.im/npm-run-all) more for parallelism and reduced noise.
  - Removed linting fix scripts.
  - Linting included in the `test` script. Travis CI will fail PR's with lint errors.
  - Custom watch script.
  - No longer use [`cross-env`](https://npm.im/cross-env); contributors with Windows may setup and use a Bash shell.
- Improved ESLint config:
  - Use [eslint-config-env](https://npm.im/eslint-config-env).
  - Removed redundant `eslint-plugin-ava` dev dependency and config.
  - Undo overriding ESLint ignoring dotfiles by default as there are none now.
- Moved the example project to [a separate repo](https://github.com/jaydenseric/graphql-react-examples).
- Better readme logo alt text.

## 1.0.0

### Major

- Capitalized the fetch options `Accept` header for display consistency in tools such as the Chrome network inspector and to better support case-sensitive systems, even though HTTP headers are supposed to be case-insensitive.

### Patch

- Updated dependencies.
- Pinned `@babel` dev dependencies to match new AVA requirements.
- Use [`eslint-config-prettier`](https://npm.im/eslint-config-prettier).
- Readme example link goes to the example project directory instead of the readme file.
- Test and example updates:
  - Use [`fake-tag`](https://npm.im/fake-tag) for GraphQL template literals due to [prettier/prettier#4360](https://github.com/prettier/prettier/issues/4360).
  - Use [`express`](https://npm.im/express) instead of Koa packages.
  - Use [`express-graphql`](https://npm.im/express-graphql) instead of Apollo packages.
- Test updates:
  - Removed [`apollo-upload-server`](https://npm.im/apollo-upload-server) as there are no upload tests yet.
  - Removed [`get-port`](https://npm.im/get-port) as not providing a port to `app.listen` has the same effect.
- Example updates:
  - Stop using [`esm`](https://npm.im/esm) due to [graphql/express-graphql#425](https://github.com/graphql/express-graphql/issues/425).
  - Enabled GraphiQL and added a link to it on the homepage.

## 1.0.0-alpha.5

### Major

- Updated the `react` peer dependency to `^16.3.1`.
- Fixed `preload` broken due to the [React v16.3.1](https://github.com/facebook/react/releases/tag/v16.3.1) [context API change](https://github.com/facebook/react/pull/12501).

### Patch

- Updated dependencies.
- Example updates:
  - Valid length app manifest `short_name`.
  - Added `<html>` `lang` attribute.
  - Added Twitter card meta tags.

## 1.0.0-alpha.4

### Minor

- Added a `fetchError` `Query` render function argument, enabling graceful caching and handling of errors in situations such as when a global `fetch` API is unavailable or a relative URL is used on the sever.

### Patch

- Updated dependencies.
- Replaced [`isomorphic-unfetch`](https://npm.im/isomorphic-unfetch) with the more updated [`cross-fetch`](https://npm.im/cross-fetch).
- Use `.prettierignore` to defer `package.json` formatting to npm.
- Improved the example web app and deployed it to [graphql-react.now.sh](https://graphql-react.now.sh).

## 1.0.0-alpha.3

### Minor

- Support the legacy React context API, fixing [#7](https://github.com/jaydenseric/graphql-react/issues/7).

### Patch

- Use [`eslint-plugin-ava`](https://npm.im/eslint-plugin-ava).

## 1.0.0-alpha.2

### Major

- Removed the `Promise` polyfill; consumers can polyfill as required for optimal bundle size. Required polyfills are documented in the readme.

### Minor

- Significantly reduced the bundle size to < 4 KB by simplifying Babel helpers and reusing the [`object-assign`](https://npm.im/object-assign) React dependency with [`babel-plugin-transform-replace-object-assign`](https://npm.im/babel-plugin-transform-replace-object-assign).

### Patch

- Updated dependencies.
- Updated ESLint config:
  - `parserOptions` is unnecessary when using `babel-eslint`.
  - Enabled `prefer-destructuring` rule.

## 1.0.0-alpha.1

### Major

- Updated Node.js support to v7.6+.
- Renamed `GraphQLProvider` and `GraphQLConsumer` to `Provider` and `Consumer`.
- No longer exporting `GraphQLQuery`.
- Swapped the `GraphQLQuery` and `Query` names.
- Removed `GraphQLMutation` component; `GraphQLQuery` can be used for both queries and mutations.
- `GraphQLQuery` component `loadOnMount` and `loadOnReset` props now default to `false`:
  - Opt-in is safer for mutations.
  - Removing `static defaultProps` reduces bundle size.
  - Nicer valueless boolean props (`<GraphQLQuery />` and `<GraphQLQuery loadOnReset />` vs `<GraphQLQuery loadOnReset={false} />` and `<GraphQLQuery loadOnReset={true} />`.
- The `GraphQL` `query` instance method now accepts an options object.
- New approach to configuring GraphQL request fetch options:
  - Removed the `GraphQL` constructor `requestOptions` option.
  - The `Query` component now has a `fetchOptionsOverride` prop, allowing components to easily query any GraphQL API. Consumers may export an override function tailored for each API in one place to make things DRY.
  - The Next.js example app has been updated to demo the new API using the external [GraphQL Pokémon](https://github.com/lucasbento/graphql-pokemon) API.

### Minor

- New `preload` API for server side rendering, fixing [#2](https://github.com/jaydenseric/graphql-react/issues/2).
- The `Query` component `resetOnLoad` prop doesn’t cause cache for the request that triggered a reset to delete, allowing simultaneous use with `loadOnReset`. Fixes [#3](https://github.com/jaydenseric/graphql-react/issues/3).
- The `GraphQL` `reset` instance method now accepts a fetch options hash to exempt a request from cache deletion.

### Patch

- Updated dependencies.
- Fetch errors when a request could not be sent at all (e.g. a relative URL can’t be used for server side rendering) are uncaught instead of incorrectly cached as a `parseError`.
- Simplified the JSDoc script, now that [Documentation.js handles `.mjs`](https://github.com/documentationjs/documentation/pull/1023).
- Prevent lib or example updates from triggering tests in watch mode.
- Fixed the example setup script and made `graphql-react` a published dependency, via [#1](https://github.com/jaydenseric/graphql-react/pull/1).
- Commented GraphQL template literals for editor syntax highlighting.
- Configured [Travis](https://travis-ci.org/jaydenseric/graphql-react) and added a build status readme badge.
- Improved API documentation.

## 0.1.0

Initial release.
