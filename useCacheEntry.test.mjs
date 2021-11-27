import { deepStrictEqual, strictEqual, throws } from 'assert';
import {
  act,
  cleanup,
  renderHook,
  suppressErrorOutput,
} from '@testing-library/react-hooks/lib/pure.js';
import { jsx } from 'react/jsx-runtime.js';
import revertableGlobals from 'revertable-globals';
import Cache from './Cache.js';
import CacheContext from './CacheContext.js';
import cacheEntryDelete from './cacheEntryDelete.js';
import cacheEntrySet from './cacheEntrySet.js';
import createArgErrorMessageProd from './createArgErrorMessageProd.js';
import assertBundleSize from './test/assertBundleSize.mjs';
import useCacheEntry from './useCacheEntry.js';

export default (tests) => {
  tests.add('`useCacheEntry` bundle size.', async () => {
    await assertBundleSize(new URL('./useCacheEntry.js', import.meta.url), 800);
  });

  tests.add('`useCacheEntry` argument 1 `cacheKey` not a string.', () => {
    const cacheKey = true;

    throws(() => {
      useCacheEntry(cacheKey);
    }, new TypeError('Argument 1 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        useCacheEntry(cacheKey);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`useCacheEntry` with cache context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useCacheEntry('a'));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Cache context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useCacheEntry` with cache context value not a `Cache` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useCacheEntry('a'), { wrapper });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError('Cache context value must be a `Cache` instance.')
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useCacheEntry` without initial cache values for each cache key used.',
    () => {
      try {
        const cache = new Cache();
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: cache,
            children,
          });

        const cacheKeyA = 'a';

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useCacheEntry(cacheKey),
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

        const cacheValueA2 = 'a2';

        act(() => {
          cacheEntrySet(cache, cacheKeyA, cacheValueA2);
        });

        strictEqual(result.all.length, 2);
        strictEqual(result.current, cacheValueA2);
        strictEqual(result.error, undefined);

        act(() => {
          cacheEntryDelete(cache, cacheKeyA);
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheKeyB = 'b';

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheValueB2 = 'b2';

        act(() => {
          cacheEntrySet(cache, cacheKeyB, cacheValueB2);
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, cacheValueB2);
        strictEqual(result.error, undefined);

        act(() => {
          cacheEntryDelete(cache, cacheKeyB);
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
    '`useCacheEntry` with initial cache values for each cache key used, replacing cache values.',
    () => {
      try {
        const cacheKeyA = 'a';
        const cacheValueA1 = 'a1';
        const cacheKeyB = 'b';
        const cacheValueB1 = 'b1';
        const cache = new Cache({
          [cacheKeyA]: cacheValueA1,
          [cacheKeyB]: cacheValueB1,
        });
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: cache,
            children,
          });

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useCacheEntry(cacheKey),
          {
            wrapper,
            initialProps: {
              cacheKey: cacheKeyA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, cacheValueA1);
        strictEqual(result.error, undefined);

        const cacheValueA2 = 'a2';

        act(() => {
          cacheEntrySet(cache, cacheKeyA, cacheValueA2);
        });

        strictEqual(result.all.length, 2);
        strictEqual(result.current, cacheValueA2);
        strictEqual(result.error, undefined);

        act(() => {
          cacheEntryDelete(cache, cacheKeyA);
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, cacheValueB1);
        strictEqual(result.error, undefined);

        const cacheValueB2 = 'b2';

        act(() => {
          cacheEntrySet(cache, cacheKeyB, cacheValueB2);
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, cacheValueB2);
        strictEqual(result.error, undefined);

        act(() => {
          cacheEntryDelete(cache, cacheKeyB);
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
    '`useCacheEntry` with initial cache value, mutating cache value.',
    () => {
      try {
        const cacheKey = 'a';
        const cacheValue = { a: 1 };
        const cache = new Cache({
          [cacheKey]: cacheValue,
        });
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: cache,
            children,
          });

        const { result } = renderHook(() => useCacheEntry(cacheKey), {
          wrapper,
        });

        strictEqual(result.all.length, 1);
        strictEqual(result.current, cacheValue);
        strictEqual(result.error, undefined);

        act(() => {
          cacheValue.a = 2;
          cache.dispatchEvent(
            new CustomEvent(`${cacheKey}/set`, {
              detail: {
                cacheValue,
              },
            })
          );
        });

        strictEqual(result.all.length, 2);
        strictEqual(result.current, cacheValue);
        strictEqual(result.error, undefined);

        act(() => {
          cacheEntryDelete(cache, cacheKey);
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
      } finally {
        cleanup();
      }
    }
  );
};
