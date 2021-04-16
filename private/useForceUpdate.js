'use strict';

const { useReducer } = require('react');

/**
 * A React hook to force the component to update and re-render.
 * @kind function
 * @name useForceUpdate
 * @returns {Function} Forces an update.
 * @see [React hooks FAQ](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate).
 * @see [Gotcha explanation](https://github.com/CharlesStover/use-force-update/issues/18#issuecomment-554486618).
 * @ignore
 */
module.exports = function useForceUpdate() {
  return useReducer(() => Symbol())[1];
};
