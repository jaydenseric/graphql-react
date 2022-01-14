// @ts-check

import { deepStrictEqual, strictEqual, throws } from "assert";
import {
  cleanup,
  renderHook,
  suppressErrorOutput,
} from "@testing-library/react-hooks/lib/pure.js";
import React from "react";
import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import HYDRATION_TIME_MS from "./HYDRATION_TIME_MS.mjs";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import useLoadOnMount from "./useLoadOnMount.mjs";

/**
 * A dummy loader for testing.
 * @type {import("./types.mjs").Loader}
 */
const dummyLoader = () =>
  new LoadingCacheValue(
    new Loading(),
    new Cache(),
    "a",
    Promise.resolve(),
    new AbortController()
  );

/**
 * Adds `useLoadOnMount` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useLoadOnMount` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadOnMount.mjs", import.meta.url),
      600
    );
  });

  tests.add("`useLoadOnMount` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadOnMount(
        // @ts-expect-error Testing invalid.
        true,
        dummyLoader
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useLoadOnMount` argument 2 `load` not a function.", () => {
    throws(() => {
      useLoadOnMount(
        "a",
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  tests.add("`useLoadOnMount` with cache context missing.", () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadOnMount("a", dummyLoader));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError("Cache context missing."));
    } finally {
      cleanup();
    }
  });

  tests.add(
    "`useLoadOnMount` with cache context value not a `Cache` instance.",
    () => {
      try {
        /** @param {{ children?: React.ReactNode }} props Props. */
        const wrapper = ({ children }) =>
          React.createElement(
            CacheContext.Provider,
            {
              // @ts-expect-error Testing invalid.
              value: true,
            },
            children
          );

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadOnMount("a", dummyLoader), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError("Cache context value must be a `Cache` instance.")
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    "`useLoadOnMount` with hydration time stamp context value not undefined or a number.",
    () => {
      try {
        const cache = new Cache();

        /** @param {{ children?: React.ReactNode }} props Props. */
        const wrapper = ({ children }) =>
          React.createElement(
            CacheContext.Provider,
            { value: cache },
            React.createElement(
              HydrationTimeStampContext.Provider,
              {
                // @ts-expect-error Testing invalid.
                value: true,
              },
              children
            )
          );

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadOnMount("a", dummyLoader), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError("Hydration time stamp context value must be a number.")
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    "`useLoadOnMount` with hydration time stamp context undefined, without initial cache values.",
    async () => {
      const cacheKeyA = "a";
      const cacheKeyB = "b";
      const cacheA = new Cache();
      const cacheB = new Cache();

      /** @type {Array<{ loader: Function, hadArgs: boolean }>} */
      let loadCalls = [];

      /** @type {import("./types.mjs").Loader} */
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @type {import("./types.mjs").Loader} */
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @param {{ cache: Cache, children?: React.ReactNode }} props Props. */
      const wrapper = ({ cache, children }) =>
        React.createElement(CacheContext.Provider, { value: cache }, children);

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
    "`useLoadOnMount` with hydration time stamp context undefined, with initial cache values.",
    async () => {
      const cacheKeyA = "a";
      const cacheKeyB = "b";
      const cacheA = new Cache({
        [cacheKeyA]: 0,
      });
      const cacheB = new Cache({
        [cacheKeyA]: 0,
        [cacheKeyB]: 0,
      });

      /** @type {Array<{ loader: Function, hadArgs: boolean }>} */
      let loadCalls = [];

      /** @type {import("./types.mjs").Loader} */
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @type {import("./types.mjs").Loader} */
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @param {{ cache: Cache, children?: React.ReactNode }} props Props. */
      const wrapper = ({ cache, children }) =>
        React.createElement(CacheContext.Provider, { value: cache }, children);

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
    "`useLoadOnMount` with hydration time stamp context defined, without initial cache values.",
    async () => {
      const cacheKeyA = "a";
      const cacheKeyB = "b";
      const cacheA = new Cache();
      const cacheB = new Cache();
      const hydrationTimeStamp = performance.now();

      /** @type {Array<{ loader: Function, hadArgs: boolean }>} */
      let loadCalls = [];

      /** @type {import("./types.mjs").Loader} */
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @type {import("./types.mjs").Loader} */
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @param {{ cache: Cache, children?: React.ReactNode }} props Props. */
      const wrapper = ({ cache, children }) =>
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            children
          )
        );

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
    "`useLoadOnMount` with hydration time stamp context defined, with initial cache values.",
    async () => {
      const cacheKeyA = "a";
      const cacheKeyB = "b";
      const cacheA = new Cache({
        [cacheKeyA]: 0,
      });
      const cacheB = new Cache({
        [cacheKeyA]: 0,
        [cacheKeyB]: 0,
      });
      const hydrationTimeStamp = performance.now();

      /** @type {Array<{ loader: Function, hadArgs: boolean }>} */
      let loadCalls = [];

      /** @type {import("./types.mjs").Loader} */
      function loadA() {
        loadCalls.push({
          loader: loadA,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @type {import("./types.mjs").Loader} */
      function loadB() {
        loadCalls.push({
          loader: loadB,
          hadArgs: !!arguments.length,
        });

        return dummyLoader();
      }

      /** @param {{ cache: Cache, children?: React.ReactNode }} props Props. */
      const wrapper = ({ cache, children }) =>
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            children
          )
        );

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
