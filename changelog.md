# graphql-react changelog

## Next

### Patch

- Remove redundant uses of `this` in the internal `GraphQLQuery` component constructor.
- Test the library with undefined and production `NODE_ENV`.

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
- Removed the package `module` field. Webpack by default resolves extensionless paths the same way Node.js in `--experimental-modules` mode does; `.mjs` files are preferred. Tools misconfigured or unable to resolve `.mjs` can get confused when `module` points to an `.mjs` ESM file and they attempt to resolve named imports from `.js` CJS files.
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
