import React from 'react'

/**
 * [React context object](https://reactjs.org/docs/context#api) for a `Date`
 * instance indicating when the ancestor
 * [`GraphQLProvider`]{@link GraphQLProvider} first rendered.
 * @type {Object}
 * @prop {function} Provider [React context provider component](https://reactjs.org/docs/context#contextprovider).
 * @prop {function} Consumer [React context consumer component](https://reactjs.org/docs/context#contextconsumer).
 * @ignore
 */
export const FirstRenderDateContext = React.createContext()

FirstRenderDateContext.displayName = 'FirstRenderDateContext'
