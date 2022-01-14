// @ts-check

import React from "react";

/**
 * [React context](https://reactjs.org/docs/context.html) for the client side
 * hydration {@link DOMHighResTimeStamp time stamp}.
 * @type {React.Context<DOMHighResTimeStamp | undefined>}
 */
const HydrationTimeStampContext = React.createContext(
  /** @type {DOMHighResTimeStamp | undefined} */ (undefined)
);

HydrationTimeStampContext.displayName = "HydrationTimeStampContext";

export default HydrationTimeStampContext;
