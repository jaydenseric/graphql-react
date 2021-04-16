'use strict';

const { deepStrictEqual, strictEqual, throws } = require('assert');
const {
  cleanup,
  renderHook,
  suppressErrorOutput,
} = require('@testing-library/react-hooks/pure');
const { jsx } = require('react/jsx-runtime');
const revertableGlobals = require('revertable-globals');
const createArgErrorMessageProd = require('../../private/createArgErrorMessageProd');
const Cache = require('../../public/Cache');
const CacheContext = require('../../public/CacheContext');
const HYDRATION_TIME_MS = require('../../public/HYDRATION_TIME_MS');
const HydrationTimeStampContext = require('../../public/HydrationTimeStampContext');
const useLoadOnMount = require('../../public/useLoadOnMount');

module.exports = (tests) => {
  tests.add('`useLoadOnMount` argument 1 `cacheKey` not a string.', () => {
    const cacheKey = true;

    throws(() => {
      useLoadOnMount(cacheKey);
    }, new TypeError('Argument 1 `cacheKey` must be a string.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        useLoadOnMount(cacheKey);
      }, new TypeError(createArgErrorMessageProd(1)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`useLoadOnMount` argument 2 `load` not a function.', () => {
    const cacheKey = 'a';
    const load = true;

    throws(() => {
      useLoadOnMount(cacheKey, load);
    }, new TypeError('Argument 2 `load` must be a function.'));

    const revertGlobals = revertableGlobals(
      { NODE_ENV: 'production' },
      process.env
    );

    try {
      throws(() => {
        useLoadOnMount(cacheKey, load);
      }, new TypeError(createArgErrorMessageProd(2)));
    } finally {
      revertGlobals();
    }
  });

  tests.add('`useLoadOnMount` with cache context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadOnMount('a', () => {}));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Cache context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useLoadOnMount` with cache context value not a `Cache` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadOnMount('a', () => {}), {
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

  tests.add(
    '`useLoadOnMount` with hydration time stamp context value not undefined or a number.',
    () => {
      try {
        const cache = new Cache();
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: cache,
            children: jsx(HydrationTimeStampContext.Provider, {
              value: true,
              children,
            }),
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadOnMount('a', () => {}), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError('Hydration time stamp context value must be a number.')
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadOnMount` with hydration time stamp context undefined, without initial cache values.',
    async () => {
      const cacheKeyA = 'a';
      const cacheKeyB = 'b';
      const cacheA = new Cache();
      const cacheB = new Cache();

      let loadCalls = [];

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });
      }

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });
      }

      const wrapper = ({ cache, children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children,
        });

      try {
        const { result, rerender } = renderHook(
          ({ cacheKey, load }) => useLoadOnMount(cacheKey, load),
          {
            wrapper,
            initialProps: {
              cache: cacheA,
              cacheKey: cacheKeyA,
              load: loadA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 2);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with the a different cache.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyA,
          load: loadA,
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different cache key.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadA,
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different loader.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadB,
        });

        strictEqual(result.all.length, 7);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadB,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 8);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadOnMount` with hydration time stamp context undefined, with initial cache values.',
    async () => {
      const cacheKeyA = 'a';
      const cacheKeyB = 'b';
      const cacheA = new Cache({
        [cacheKeyA]: 0,
      });
      const cacheB = new Cache({
        [cacheKeyA]: 0,
        [cacheKeyB]: 0,
      });

      let loadCalls = [];

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });
      }

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });
      }

      const wrapper = ({ cache, children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children,
        });

      try {
        const { result, rerender } = renderHook(
          ({ cacheKey, load }) => useLoadOnMount(cacheKey, load),
          {
            wrapper,
            initialProps: {
              cache: cacheA,
              cacheKey: cacheKeyA,
              load: loadA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 2);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with the a different cache.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyA,
          load: loadA,
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different cache key.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadA,
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different loader.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadB,
        });

        strictEqual(result.all.length, 7);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadB,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 8);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadOnMount` with hydration time stamp context defined, without initial cache values.',
    async () => {
      const cacheKeyA = 'a';
      const cacheKeyB = 'b';
      const cacheA = new Cache();
      const cacheB = new Cache();
      const hydrationTimeStamp = performance.now();

      let loadCalls = [];

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });
      }

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });
      }

      const wrapper = ({ cache, children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children: jsx(HydrationTimeStampContext.Provider, {
            value: hydrationTimeStamp,
            children,
          }),
        });

      try {
        const { result, rerender } = renderHook(
          ({ cacheKey, load }) => useLoadOnMount(cacheKey, load),
          {
            wrapper,
            initialProps: {
              cache: cacheA,
              cacheKey: cacheKeyA,
              load: loadA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 2);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with the a different cache.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyA,
          load: loadA,
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different cache key.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadA,
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different loader.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadB,
        });

        strictEqual(result.all.length, 7);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadB,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 8);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    '`useLoadOnMount` with hydration time stamp context defined, with initial cache values.',
    async () => {
      const cacheKeyA = 'a';
      const cacheKeyB = 'b';
      const cacheA = new Cache({
        [cacheKeyA]: 0,
      });
      const cacheB = new Cache({
        [cacheKeyA]: 0,
        [cacheKeyB]: 0,
      });
      const hydrationTimeStamp = performance.now();

      let loadCalls = [];

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });
      }

      // eslint-disable-next-line jsdoc/require-jsdoc
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });
      }

      const wrapper = ({ cache, children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children: jsx(HydrationTimeStampContext.Provider, {
            value: hydrationTimeStamp,
            children,
          }),
        });

      try {
        const { result, rerender } = renderHook(
          ({ cacheKey, load }) => useLoadOnMount(cacheKey, load),
          {
            wrapper,
            initialProps: {
              cache: cacheA,
              cacheKey: cacheKeyA,
              load: loadA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 2);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with the a different cache.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyA,
          load: loadA,
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different cache key.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadA,
        });

        strictEqual(result.all.length, 5);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test re-rendering with a different loader.
        rerender({
          cache: cacheB,
          cacheKey: cacheKeyB,
          load: loadB,
        });

        strictEqual(result.all.length, 7);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Test that re-rendering doesn’t cause another load.
        rerender();

        strictEqual(result.all.length, 8);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, []);

        // Wait for the hydration time to expire.
        await new Promise((resolve) =>
          setTimeout(resolve, HYDRATION_TIME_MS + 50)
        );

        // Test re-rendering with the a different cache.
        rerender({
          cache: cacheA,
          cacheKey: cacheKeyB,
          load: loadB,
        });

        strictEqual(result.all.length, 9);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadB,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test re-rendering with the a different cache key.
        rerender({
          cache: cacheA,
          cacheKey: cacheKeyA,
          load: loadB,
        });

        strictEqual(result.all.length, 10);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadB,
            hadArgs: false,
          },
        ]);

        loadCalls = [];

        // Test re-rendering with the a different loader.
        rerender({
          cache: cacheA,
          cacheKey: cacheKeyA,
          load: loadA,
        });

        strictEqual(result.all.length, 11);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
        deepStrictEqual(loadCalls, [
          {
            loader: loadA,
            hadArgs: false,
          },
        ]);
      } finally {
        cleanup();
      }
    }
  );
};
