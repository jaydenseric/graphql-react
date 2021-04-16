'use strict';

const { deepStrictEqual, strictEqual, throws } = require('assert');
const {
  act,
  cleanup,
  renderHook,
  suppressErrorOutput,
} = require('@testing-library/react-hooks/pure');
const { jsx } = require('react/jsx-runtime');
const revertableGlobals = require('revertable-globals');
const createArgErrorMessageProd = require('../../private/createArgErrorMessageProd');
const Cache = require('../../public/Cache');
const CacheContext = require('../../public/CacheContext');
const cacheEntryPrune = require('../../public/cacheEntryPrune');
const useCacheEntryPrunePrevention = require('../../public/useCacheEntryPrunePrevention');

module.exports = (tests) => {
  tests.add(
    '`useCacheEntryPrunePrevention` argument 1 `cacheKey` not a string.',
    () => {
      const cacheKey = true;

      throws(() => {
        useCacheEntryPrunePrevention(cacheKey);
      }, new TypeError('Argument 1 `cacheKey` must be a string.'));

      const revertGlobals = revertableGlobals(
        { NODE_ENV: 'production' },
        process.env
      );

      try {
        throws(() => {
          useCacheEntryPrunePrevention(cacheKey);
        }, new TypeError(createArgErrorMessageProd(1)));
      } finally {
        revertGlobals();
      }
    }
  );

  tests.add(
    '`useCacheEntryPrunePrevention` with cache context missing.',
    () => {
      try {
        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useCacheEntryPrunePrevention('a'));
        } finally {
          revertConsole();
        }

        deepStrictEqual(result.error, new TypeError('Cache context missing.'));
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useCacheEntryPrunePrevention` with cache context value not a `Cache` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useCacheEntryPrunePrevention('a'), {
            wrapper,
          });
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

  tests.add('`useCacheEntryPrunePrevention` functionality.', () => {
    try {
      const cacheKeyA = 'a';
      const cacheKeyB = 'b';
      const initialCacheStore = {
        [cacheKeyA]: 1,
        [cacheKeyB]: 2,
      };
      const cache = new Cache({ ...initialCacheStore });
      const wrapper = ({ children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children,
        });

      const { result, rerender } = renderHook(
        ({ cacheKey }) => useCacheEntryPrunePrevention(cacheKey),
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

      act(() => {
        // This cache entry prune should be prevented.
        cacheEntryPrune(cache, cacheKeyA);
      });

      deepStrictEqual(cache.store, initialCacheStore);

      strictEqual(result.all.length, 1);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      rerender({ cacheKey: cacheKeyB });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      act(() => {
        // This cache entry prune should be prevented.
        cacheEntryPrune(cache, cacheKeyB);
      });

      deepStrictEqual(cache.store, initialCacheStore);

      strictEqual(result.all.length, 2);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      act(() => {
        // This cache entry prune should no longer be prevented.
        cacheEntryPrune(cache, cacheKeyA);
      });

      deepStrictEqual(cache.store, { [cacheKeyB]: 2 });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
