import { deepStrictEqual, strictEqual, throws } from 'assert';
import {
  act,
  cleanup,
  renderHook,
  suppressErrorOutput,
} from '@testing-library/react-hooks/lib/pure.js';
import { jsx } from 'react/jsx-runtime.js';
import revertableGlobals from 'revertable-globals';
import createArgErrorMessageProd from '../../private/createArgErrorMessageProd.js';
import Cache from '../../public/Cache.js';
import Loading from '../../public/Loading.js';
import LoadingCacheValue from '../../public/LoadingCacheValue.js';
import LoadingContext from '../../public/LoadingContext.js';
import useLoadingEntry from '../../public/useLoadingEntry.js';

export default (tests) => {
  tests.add('`useLoadingEntry` argument 1 `cacheKey` not a string.', () => {
    const cacheKey = true;

    throws(() => {
      useLoadingEntry(cacheKey);
    }, new TypeError('Argument 1 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        useLoadingEntry(cacheKey);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`useLoadingEntry` with loading context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadingEntry('a'));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Loading context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useLoadingEntry` with loading context value not a `Loading` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(LoadingContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadingEntry('a'), { wrapper });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError('Loading context value must be a `Loading` instance.')
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadingEntry` without initial loading for each cache key used.',
    async () => {
      try {
        const loading = new Loading();
        const cache = new Cache();
        const wrapper = ({ children }) =>
          jsx(LoadingContext.Provider, {
            value: loading,
            children,
          });

        const cacheKeyA = 'a';

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useLoadingEntry(cacheKey),
          {
            wrapper,
            initialProps: {
              cacheKey: cacheKeyA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        let loadingA1ResultResolve;

        const loadingA1Result = new Promise((resolve) => {
          loadingA1ResultResolve = resolve;
        });

        let loadingA1CacheValue;

        act(() => {
          loadingA1CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyA,
            loadingA1Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 2);
        deepStrictEqual(result.current, new Set([loadingA1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA1ResultResolve({});
          await loadingA1CacheValue.promise;
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheKeyB = 'b';

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        let loadingB1ResultResolve;

        const loadingB1Result = new Promise((resolve) => {
          loadingB1ResultResolve = resolve;
        });

        let loadingB1CacheValue;

        act(() => {
          loadingB1CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyB,
            loadingB1Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 5);
        deepStrictEqual(result.current, new Set([loadingB1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingB1ResultResolve({});
          await loadingB1CacheValue.promise;
        });

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadingEntry` with initial loading for each cache key used.',
    async () => {
      try {
        const loading = new Loading();
        const cache = new Cache();
        const cacheKeyA = 'a';

        let loadingA1ResultResolve;

        const loadingA1Result = new Promise((resolve) => {
          loadingA1ResultResolve = resolve;
        });
        const loadingA1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyA,
          loadingA1Result,
          new AbortController()
        );

        const wrapper = ({ children }) =>
          jsx(LoadingContext.Provider, {
            value: loading,
            children,
          });

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useLoadingEntry(cacheKey),
          {
            wrapper,
            initialProps: {
              cacheKey: cacheKeyA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        deepStrictEqual(result.current, new Set([loadingA1CacheValue]));
        strictEqual(result.error, undefined);

        let loadingA2ResultResolve;

        const loadingA2Result = new Promise((resolve) => {
          loadingA2ResultResolve = resolve;
        });

        let loadingA2CacheValue;

        act(() => {
          loadingA2CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyA,
            loadingA2Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 2);
        deepStrictEqual(
          result.current,
          new Set([loadingA1CacheValue, loadingA2CacheValue])
        );
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA1ResultResolve({});
          await loadingA1CacheValue.promise;
        });

        strictEqual(result.all.length, 3);
        deepStrictEqual(result.current, new Set([loadingA2CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA2ResultResolve({});
          await loadingA2CacheValue.promise;
        });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheKeyB = 'b';

        let loadingB1ResultResolve;

        const loadingB1Result = new Promise((resolve) => {
          loadingB1ResultResolve = resolve;
        });

        let loadingB1CacheValue;

        loadingB1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyB,
          loadingB1Result,
          new AbortController()
        );

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 5);
        deepStrictEqual(result.current, new Set([loadingB1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingB1ResultResolve({});
          await loadingB1CacheValue.promise;
        });

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
      } finally {
        cleanup();
      }
    }
  );
};
