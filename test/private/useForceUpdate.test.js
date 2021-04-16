'use strict';

const { strictEqual } = require('assert');
const {
  act,
  cleanup,
  renderHook,
} = require('@testing-library/react-hooks/pure');
const useForceUpdate = require('../../private/useForceUpdate');

module.exports = (tests) => {
  tests.add('`useForceUpdate` forcing an update.', async () => {
    try {
      const { result } = renderHook(() => useForceUpdate());

      strictEqual(result.all.length, 1);
      strictEqual(typeof result.current, 'function');
      strictEqual(result.error, undefined);

      act(() => {
        result.current();
      });

      strictEqual(result.all.length, 2);
      strictEqual(typeof result.current, 'function');
      strictEqual(result.error, undefined);

      act(() => {
        result.current();
      });

      strictEqual(result.all.length, 3);
      strictEqual(typeof result.current, 'function');
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
