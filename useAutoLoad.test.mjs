// @ts-check

import { ok, strictEqual, throws } from "node:assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import cacheEntryPrune from "./cacheEntryPrune.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertTypeOf from "./test/assertTypeOf.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useAutoLoad from "./useAutoLoad.mjs";

/**
 * Adds `useAutoLoad` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useAutoLoad` bundle size.", async () => {
    await assertBundleSize(new URL("./useAutoLoad.mjs", import.meta.url), 900);
  });

  tests.add("`useAutoLoad` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useAutoLoad(
        // @ts-expect-error Testing invalid.
        true,
        new LoadingCacheValue(
          new Loading(),
          new Cache(),
          "a",
          Promise.resolve(),
          new AbortController()
        )
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useAutoLoad` argument 2 `load` not a function.", () => {
    throws(() => {
      useAutoLoad(
        "a",
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  tests.add("`useAutoLoad` functionality.", async () => {
    const cacheKey = "a";
    const cache = new Cache({
      // Populate the cache entry so it can be deleted.
      [cacheKey]: 0,
    });
    const loading = new Loading();

    /**
     * @type {Array<{
     *   hadArgs: boolean,
     *   loadingCacheValue: LoadingCacheValue
     * }>}
     */
    const loadCalls = [];

    /** @type {import("./types.mjs").Loader} */
    function load() {
      const loadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        Promise.resolve(1),
        new AbortController()
      );

      loadCalls.push({
        hadArgs: !!arguments.length,
        loadingCacheValue,
      });

      return loadingCacheValue;
    }

    // Test load on mount.

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    const testRenderer = createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cache },
        React.createElement(ReactHookTest, {
          useHook: () => useAutoLoad(cacheKey, load),
          results,
        })
      )
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    assertTypeOf(results[0].returned, "function");
    strictEqual(loadCalls.length, 1);
    strictEqual(loadCalls[0].hadArgs, false);
    strictEqual(
      loadCalls[0].loadingCacheValue.abortController.signal.aborted,
      false
    );

    // Test that the returned auto abort load function is memoized, and that
    // re-rendering doesn’t result in another load.

    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, results[0].returned);
    strictEqual(loadCalls.length, 1);

    // Test prune prevention.

    cacheEntryPrune(cache, cacheKey);

    strictEqual(cacheKey in cache.store, true);

    // Test load on stale.

    cacheEntryStale(cache, cacheKey);

    strictEqual(loadCalls.length, 2);
    strictEqual(
      loadCalls[0].loadingCacheValue.abortController.signal.aborted,
      true
    );
    strictEqual(loadCalls[1].hadArgs, false);
    strictEqual(
      loadCalls[1].loadingCacheValue.abortController.signal.aborted,
      false
    );

    // Test load on delete.

    cacheEntryDelete(cache, cacheKey);

    strictEqual(loadCalls.length, 3);
    strictEqual(
      loadCalls[1].loadingCacheValue.abortController.signal.aborted,
      true
    );
    strictEqual(loadCalls[2].hadArgs, false);
    strictEqual(
      loadCalls[2].loadingCacheValue.abortController.signal.aborted,
      false
    );

    // Nothing should have caused a re-render.
    strictEqual(results.length, 2);

    // Test that the last loading is aborted on unmount.
    ReactTestRenderer.act(() => {
      testRenderer.unmount();
    });

    strictEqual(
      loadCalls[2].loadingCacheValue.abortController.signal.aborted,
      true
    );
  });
};
