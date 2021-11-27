import { strictEqual } from 'assert';
import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react-hooks/lib/pure.js';
import useForceUpdate from './useForceUpdate.mjs';

export default (tests) => {
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
