'use strict';

const React = require('react');

/**
 * React context for the client side hydration [time stamp]{@link HighResTimeStamp}.
 * @kind member
 * @name HydrationTimeStampContext
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context.html#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer).
 * @example <caption>How to `import`.</caption>
 * ```js
 * import HydrationTimeStampContext from 'graphql-react/HydrationTimeStampContext.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const HydrationTimeStampContext = require('graphql-react/HydrationTimeStampContext.js');
 * ```
 */
const HydrationTimeStampContext = React.createContext();

if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
  HydrationTimeStampContext.displayName = 'HydrationTimeStampContext';

module.exports = HydrationTimeStampContext;
