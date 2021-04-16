'use strict';

const { createContext } = require('react');

/**
 * React context for a [`Loading`]{@link Loading} instance.
 * @kind member
 * @name LoadingContext
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context.html#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer).
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { LoadingContext } from 'graphql-react';
 * ```
 *
 * ```js
 * import LoadingContext from 'graphql-react/public/LoadingContext.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { LoadingContext } = require('graphql-react');
 * ```
 *
 * ```js
 * const LoadingContext = require('graphql-react/public/LoadingContext');
 * ```
 */
const LoadingContext = createContext();

if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
  LoadingContext.displayName = 'LoadingContext';

module.exports = LoadingContext;
