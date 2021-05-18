import { notStrictEqual, strictEqual, throws } from 'assert';
import { cleanup, renderHook } from '@testing-library/react-hooks/lib/pure.js';
import { jsx } from 'react/jsx-runtime.js';
import revertableGlobals from 'revertable-globals';
import createArgErrorMessageProd from '../../private/createArgErrorMessageProd.js';
import Cache from '../../public/Cache.js';
import CacheContext from '../../public/CacheContext.js';
import Loading from '../../public/Loading.js';
import LoadingCacheValue from '../../public/LoadingCacheValue.js';
import useAutoAbortLoad from '../../public/useAutoAbortLoad.js';

export default (tests) => {
  tests.add('`useAutoAbortLoad` argument 1 `load` not a function.', () => {
    const load = true;

    throws(() => {
      useAutoAbortLoad(load);
    }, new TypeError('Argument 1 `load` must be a function.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        useAutoAbortLoad(load);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`useAutoAbortLoad` functionality.', async () => {
    const cache = new Cache();
    const loading = new Loading();
    const loadCalls = [];

    // eslint-disable-next-line jsdoc/require-jsdoc
    function loadA() {
      const loadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        'a',
        Promise.resolve(1),
        new AbortController()
      );

      loadCalls.push({
        loader: loadA,
        hadArgs: !!arguments.length,
        loadingCacheValue,
      });

      return loadingCacheValue;
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    function loadB() {
      const loadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        'a',
        Promise.resolve(1),
        new AbortController()
      );

      loadCalls.push({
        loader: loadB,
        hadArgs: !!arguments.length,
        loadingCacheValue,
      });

      return loadingCacheValue;
    }

    const wrapper = ({ children }) =>
      jsx(CacheContext.Provider, {
        value: cache,
        children,
      });

    try {
      const { result, rerender, unmount } = renderHook(
        ({ load }) => useAutoAbortLoad(load),
        {
          wrapper,
          initialProps: {
            load: loadA,
          },
        }
      );

      strictEqual(result.all.length, 1);
      strictEqual(typeof result.current, 'function');
      strictEqual(result.error, undefined);
      strictEqual(loadCalls.length, 0);

      // Test that the returned auto abort load function is memoized.
      rerender();

      strictEqual(result.all.length, 2);
      strictEqual(result.current, result.all[0]);
      strictEqual(result.error, undefined);
      strictEqual(loadCalls.length, 0);

      // Start the first loading.
      result.current();

      strictEqual(loadCalls.length, 1);
      strictEqual(loadCalls[0].loader, loadA);
      strictEqual(loadCalls[0].hadArgs, false);
      strictEqual(
        loadCalls[0].loadingCacheValue.abortController.signal.aborted,
        false
      );

      // Start the second loading, before the first ends. This should abort the
      // first.
      result.current();

      strictEqual(loadCalls.length, 2);
      strictEqual(
        loadCalls[0].loadingCacheValue.abortController.signal.aborted,
        true
      );
      strictEqual(loadCalls[1].hadArgs, false);
      strictEqual(loadCalls[1].loader, loadA);
      strictEqual(
        loadCalls[1].loadingCacheValue.abortController.signal.aborted,
        false
      );

      // Test that changing the loader causes the returned memoized auto abort
      // load function to change, and the last loading to abort.
      rerender({ load: loadB });

      strictEqual(result.all.length, 3);
      strictEqual(typeof result.current, 'function');
      notStrictEqual(result.current, result.all[1]);
      strictEqual(result.error, undefined);
      strictEqual(loadCalls.length, 2);
      strictEqual(
        loadCalls[1].loadingCacheValue.abortController.signal.aborted,
        true
      );

      // Test that the returned newly memoized abort load function works.
      result.current();

      strictEqual(loadCalls.length, 3);
      strictEqual(loadCalls[2].loader, loadB);
      strictEqual(loadCalls[2].hadArgs, false);
      strictEqual(
        loadCalls[2].loadingCacheValue.abortController.signal.aborted,
        false
      );

      // Test that the last loading is aborted on unmount.
      unmount();

      strictEqual(
        loadCalls[2].loadingCacheValue.abortController.signal.aborted,
        true
      );
    } finally {
      cleanup();
    }
  });
};
