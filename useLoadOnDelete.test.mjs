// @ts-check

/**
 * @import { ReactHookResult } from "./test/ReactHookTest.mjs"
 * @import { Loader } from "./types.mjs"
 */

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoadOnDelete from "./useLoadOnDelete.mjs";

describe("React hook `useLoadOnDelete`.", { concurrency: true }, () => {
  /**
   * Dummy loader for testing.
   * @type {Loader}
   */
  const dummyLoader = () =>
    new LoadingCacheValue(
      new Loading(),
      new Cache(),
      "a",
      Promise.resolve(),
      new AbortController(),
    );

  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadOnDelete.mjs", import.meta.url),
      500,
    );
  });

  it("Argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadOnDelete(
        // @ts-expect-error Testing invalid.
        true,
        dummyLoader,
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  it("Argument 2 `load` not a function.", () => {
    throws(() => {
      useLoadOnDelete(
        "a",
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  it("Cache context missing.", () => {
    /** @type {Array<ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: () => useLoadOnDelete("a", dummyLoader),
        results,
      }),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(results[0].threw, new TypeError("Cache context missing."));
  });

  it("Cache context value not a `Cache` instance.", () => {
    /** @type {Array<ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        {
          // @ts-expect-error Testing invalid.
          value: true,
        },
        React.createElement(ReactHookTest, {
          useHook: () => useLoadOnDelete("a", dummyLoader),
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Cache context value must be a `Cache` instance."),
    );
  });

  it("Functionality.", async () => {
    const cacheKeyA = "a";
    const cacheKeyB = "b";
    const cacheA = new Cache({
      // Populate the cache entry so it can be deleted.
      [cacheKeyA]: 0,
    });
    const cacheB = new Cache({
      // Populate the cache entries so they can be deleted.
      [cacheKeyA]: 0,
      [cacheKeyB]: 0,
    });

    /** @type {Array<{ loader: Function, hadArgs: boolean }>} */
    let loadCalls = [];

    /** @type {Loader} */
    function loadA() {
      loadCalls.push({
        loader: loadA,
        hadArgs: !!arguments.length,
      });

      return dummyLoader();
    }

    /** @type {Loader} */
    function loadB() {
      loadCalls.push({
        loader: loadB,
        hadArgs: !!arguments.length,
      });

      return dummyLoader();
    }

    /** @type {Array<ReactHookResult>} */
    const results = [];

    const testRenderer = createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cacheA },
        React.createElement(ReactHookTest, {
          useHook: () => useLoadOnDelete(cacheKeyA, loadA),
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);

    cacheEntryDelete(cacheA, cacheKeyA);

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
            useHook: () => useLoadOnDelete(cacheKeyA, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);

    cacheEntryDelete(cacheB, cacheKeyA);

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
            useHook: () => useLoadOnDelete(cacheKeyB, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);

    cacheEntryDelete(cacheB, cacheKeyB);

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
            useHook: () => useLoadOnDelete(cacheKeyB, loadB),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);

    // Repopulate the cache entry with any value so it can be deleted again.
    cacheEntrySet(cacheB, cacheKeyB, 0);
    cacheEntryDelete(cacheB, cacheKeyB);

    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    // Nothing should have caused a re-render.
    strictEqual(results.length, 4);
  });
});
