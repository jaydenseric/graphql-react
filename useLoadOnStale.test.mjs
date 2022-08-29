// @ts-check

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoadOnStale from "./useLoadOnStale.mjs";

/**
 * Dummy loader for testing.
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
 * Adds `useLoadOnStale` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useLoadOnStale` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadOnStale.mjs", import.meta.url),
      500
    );
  });

  tests.add("`useLoadOnStale` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadOnStale(
        // @ts-expect-error Testing invalid.
        true,
        dummyLoader
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useLoadOnStale` argument 2 `load` not a function.", () => {
    throws(() => {
      useLoadOnStale(
        "a",
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  tests.add("`useLoadOnStale` with cache context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: () => useLoadOnStale("a", dummyLoader),
        results,
      })
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(results[0].threw, new TypeError("Cache context missing."));
  });

  tests.add(
    "`useLoadOnStale` with cache context value not a `Cache` instance.",
    () => {
      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          {
            // @ts-expect-error Testing invalid.
            value: true,
          },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnStale("a", dummyLoader),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("threw" in results[0]);
      deepStrictEqual(
        results[0].threw,
        new TypeError("Cache context value must be a `Cache` instance.")
      );
    }
  );

  tests.add("`useLoadOnStale` functionality.", async () => {
    const cacheKeyA = "a";
    const cacheKeyB = "b";
    const cacheA = new Cache({
      // Populate the cache entry so it can be staled.
      [cacheKeyA]: 0,
    });
    const cacheB = new Cache({
      // Populate the cache entries so they can be staled.
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

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    const testRenderer = createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cacheA },
        React.createElement(ReactHookTest, {
          useHook: () => useLoadOnStale(cacheKeyA, loadA),
          results,
        })
      )
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);

    cacheEntryStale(cacheA, cacheKeyA);

    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering with the a different cache causes the listener
    // to be moved to the new cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnStale(cacheKeyA, loadA),
            results,
          })
        )
      );
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);

    cacheEntryStale(cacheB, cacheKeyA);

    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering with a different cache key causes the listener
    // to be updated.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnStale(cacheKeyB, loadA),
            results,
          })
        )
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);

    cacheEntryStale(cacheB, cacheKeyB);

    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering with a different loader causes the listener
    // to be updated.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnStale(cacheKeyB, loadB),
            results,
          })
        )
      );
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);

    cacheEntryStale(cacheB, cacheKeyB);

    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    // Nothing should have caused a re-render.
    strictEqual(results.length, 4);
  });
};
