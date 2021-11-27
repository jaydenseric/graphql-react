import React from "react";

/**
 * React context for the client side hydration [time stamp]{@link HighResTimeStamp}.
 * @kind member
 * @name HydrationTimeStampContext
 * @type {object}
 * @prop {Function} Provider [React context provider component](https://reactjs.org/docs/context.html#contextprovider).
 * @prop {Function} Consumer [React context consumer component](https://reactjs.org/docs/context.html#contextconsumer).
 * @example <caption>How to `import`.</caption>
 * ```js
 * import HydrationTimeStampContext from "graphql-react/HydrationTimeStampContext.mjs";
 * ```
 */
const HydrationTimeStampContext = React.createContext();

HydrationTimeStampContext.displayName = "HydrationTimeStampContext";

export default HydrationTimeStampContext;
