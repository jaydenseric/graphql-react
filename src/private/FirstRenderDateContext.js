'use strict';

const React = require('react');

/**
 * [React context object](https://reactjs.org/docs/context#api) for a `Date`
 * instance indicating when the ancestor
 * [`GraphQLProvider`]{@link GraphQLProvider} first rendered.
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context#contextconsumer).
 * @ignore
 */
const FirstRenderDateContext = React.createContext();

if (typeof process === 'object' && process.env.NODE_ENV !== 'production')
  FirstRenderDateContext.displayName = 'FirstRenderDateContext';

module.exports = FirstRenderDateContext;
