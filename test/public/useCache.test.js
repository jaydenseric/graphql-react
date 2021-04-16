'use strict';

const { deepStrictEqual, strictEqual } = require('assert');
const {
  cleanup,
  renderHook,
  suppressErrorOutput,
} = require('@testing-library/react-hooks/pure');
const { jsx } = require('react/jsx-runtime');
const Cache = require('../../public/Cache');
const CacheContext = require('../../public/CacheContext');
const useCache = require('../../public/useCache');

module.exports = (tests) => {
  tests.add('`useCache` with cache context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useCache());
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Cache context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useCache` with cache context value not a `Cache` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useCache(), { wrapper });
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

  tests.add('`useCache` getting the cache.', () => {
    try {
      const wrapper = ({ cache, children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children,
        });

      const cacheA = new Cache();

      const { result, rerender } = renderHook(() => useCache(), {
        wrapper,
        initialProps: {
          cache: cacheA,
        },
      });

      strictEqual(result.all.length, 1);
      strictEqual(result.current, cacheA);
      strictEqual(result.error, undefined);

      const cacheB = new Cache();

      rerender({ cache: cacheB });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, cacheB);
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
