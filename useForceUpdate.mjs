// @ts-check

import React from "react";

/**
 * React hook to force the component to update and re-render on demand.
 * @returns {() => void} Function that forces an update.
 * @see [React hooks FAQ](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate).
 * @see [Gotcha explanation](https://github.com/CharlesStover/use-force-update/issues/18#issuecomment-554486618).
 */
export default function useForceUpdate() {
  return React.useReducer(() => Symbol(), Symbol())[1];
}
