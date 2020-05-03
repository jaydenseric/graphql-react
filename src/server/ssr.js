'use strict';

const ReactDOMServer = require('react-dom/server.node.js');
const GraphQL = require('../universal/GraphQL.js');

/**
 * Asynchronously server side renders a [React node]{@link ReactNode},
 * preloading all GraphQL queries set to `loadOnMount`. After resolving, cache
 * can be exported from the
 * [`GraphQL` instance property `cache`]{@link GraphQL#cache} for serialization
 * (usually to JSON) and transport to the client for hydration via the
 * [`GraphQL` constructor parameter `options.cache`]{@link GraphQL}.
 *
 * Be sure to globally polyfill [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API).
 * @kind function
 * @name ssr
 * @param {GraphQL} graphql [`GraphQL`]{@link GraphQL} instance.
 * @param {ReactNode} node React virtual DOM node.
 * @param {Function} [render=ReactDOMServer.renderToStaticMarkup] Synchronous React server side render function, defaulting to [`ReactDOMServer.renderToStaticMarkup`](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup) as it is more efficient than [`ReactDOMServer.renderToString`](https://reactjs.org/docs/react-dom-server.html#rendertostring).
 * @returns {Promise<string>} Promise resolving the rendered HTML string.
 * @see [`ReactDOMServer` docs](https://reactjs.org/docs/react-dom-server).
 * @see [`next-graphql-react`](https://npm.im/next-graphql-react) to use this API in a [Next.js](https://nextjs.org) project.
 * @example <caption>SSR function that resolves a HTML string and cache JSON for client hydration.</caption>
 * ```jsx
 * import { GraphQL, GraphQLProvider } from 'graphql-react';
 * import { ssr } from 'graphql-react/server';
 * import React from 'react';
 * import ReactDOMServer from 'react-dom/server';
 * import { App } from './components/App.mjs';
 *
 * async function render() {
 *   const graphql = new GraphQL();
 *   const page = (
 *     <GraphQLProvider graphql={graphql}>
 *       <App />
 *     </GraphQLProvider>
 *   );
 *   const html = await ssr(graphql, page, ReactDOMServer.renderToString);
 *   const cache = JSON.stringify(graphql.cache);
 *   return { html, cache };
 * }
 * ```
 * @example <caption>SSR function that resolves a HTML string suitable for a static page.</caption>
 * ```jsx
 * import { GraphQL, GraphQLProvider } from 'graphql-react';
 * import { ssr } from 'graphql-react/server';
 * import React from 'react';
 * import { App } from './components/App.mjs';
 *
 * function render() {
 *   const graphql = new GraphQL();
 *   const page = (
 *     <GraphQLProvider graphql={graphql}>
 *       <App />
 *     </GraphQLProvider>
 *   );
 *   return ssr(graphql, page);
 * }
 * ```
 */
module.exports = async function ssr(
  graphql,
  node,
  render = ReactDOMServer.renderToStaticMarkup
) {
  if (!(graphql instanceof GraphQL))
    throw new Error('ssr() argument 1 must be a GraphQL instance.');

  // Check argument 2 exists, allowing an undefined value as that is a valid
  // React node.
  if (arguments.length < 2)
    throw new Error('ssr() argument 2 must be a React node.');

  if (typeof render !== 'function')
    throw new Error('ssr() argument 3 must be a function.');

  // Signal that queries should load at render.
  graphql.ssr = true;

  /**
   * Repeatedly renders the node until all queries within are cached.
   * @returns {Promise<string>} Resolves the final rendered HTML string.
   * @ignore
   */
  async function recurse() {
    const string = render(node);
    const operations = Object.values(graphql.operations);

    if (operations.length) {
      await Promise.all(operations);
      return recurse();
    } else {
      delete graphql.ssr;
      return string;
    }
  }

  return recurse();
};
