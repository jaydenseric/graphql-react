import React from "react";

/**
 * React context for a [`Loading`]{@link Loading} instance.
 * @kind member
 * @name LoadingContext
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context.html#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer).
 * @example <caption>How to `import`.</caption>
 * ```js
 * import LoadingContext from "graphql-react/LoadingContext.mjs";
 * ```
 */
const LoadingContext = React.createContext();

LoadingContext.displayName = "LoadingContext";

export default LoadingContext;
