// @ts-check

import { notStrictEqual, ok, strictEqual, throws } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertTypeOf from "./test/assertTypeOf.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useAutoAbortLoad from "./useAutoAbortLoad.mjs";

/**
 * Adds `useAutoAbortLoad` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useAutoAbortLoad` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useAutoAbortLoad.mjs", import.meta.url),
      300
    );
  });

  tests.add("`useAutoAbortLoad` argument 1 `load` not a function.", () => {
    throws(() => {
      useAutoAbortLoad(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `load` must be a function."));
  });

  tests.add("`useAutoAbortLoad` functionality.", async () => {
    const cache = new Cache();
    const loading = new Loading();

    /**
     * @type {Array<{
     *   loader: import("./types.mjs").Loader,
     *   hadArgs: boolean,
     *   loadingCacheValue: LoadingCacheValue
     * }>}
     */
    const loadCalls = [];

    /** @type {import("./types.mjs").Loader} */
    function loadA() {
      const loadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        "a",
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

    /** @type {import("./types.mjs").Loader} */
    function loadB() {
      const loadingCacheValue = new LoadingCacheValue(
        loading,
        cache,
        "a",
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

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    const testRenderer = createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cache },
        React.createElement(ReactHookTest, {
          useHook: () => useAutoAbortLoad(loadA),
          results,
        })
      )
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    assertTypeOf(results[0].returned, "function");
    strictEqual(loadCalls.length, 0);

    // Test that the returned auto abort load function is memoized.
    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    strictEqual(loadCalls.length, 0);

    // Start the first loading.
    results[0].returned();

    strictEqual(loadCalls.length, 1);
    strictEqual(loadCalls[0].loader, loadA);
    strictEqual(loadCalls[0].hadArgs, false);
    strictEqual(
      loadCalls[0].loadingCacheValue.abortController.signal.aborted,
      false
    );

    // Start the second loading, before the first ends. This should abort the
    // first.
    results[0].returned();

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
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () => useAutoAbortLoad(loadB),
            results,
          })
        )
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    assertTypeOf(results[2].returned, "function");
    notStrictEqual(results[2].returned, results[1]);
    strictEqual(loadCalls.length, 2);
    strictEqual(
      loadCalls[1].loadingCacheValue.abortController.signal.aborted,
      true
    );

    // Test that the returned newly memoized abort load function works.
    results[2].returned();

    strictEqual(loadCalls.length, 3);
    strictEqual(loadCalls[2].loader, loadB);
    strictEqual(loadCalls[2].hadArgs, false);
    strictEqual(
      loadCalls[2].loadingCacheValue.abortController.signal.aborted,
      false
    );

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
