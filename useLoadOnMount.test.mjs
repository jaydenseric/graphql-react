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
import HYDRATION_TIME_MS from "./HYDRATION_TIME_MS.mjs";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoadOnMount from "./useLoadOnMount.mjs";

describe("React hook `useLoadOnMount`.", { concurrency: true }, () => {
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
      new URL("./useLoadOnMount.mjs", import.meta.url),
      600,
    );
  });

  it("Argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadOnMount(
        // @ts-expect-error Testing invalid.
        true,
        dummyLoader,
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  it("Argument 2 `load` not a function.", () => {
    throws(() => {
      useLoadOnMount(
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
        useHook: () => useLoadOnMount("a", dummyLoader),
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
          useHook: () => useLoadOnMount("a", dummyLoader),
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

  it("Hydration time stamp context value not undefined or a number.", () => {
    const cache = new Cache();

    /** @type {Array<ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        {
          // @ts-expect-error Testing invalid.
          value: true,
        },
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(
            HydrationTimeStampContext.Provider,
            {
              // @ts-expect-error Testing invalid.
              value: true,
            },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount("a", dummyLoader),
              results,
            }),
          ),
        ),
      ),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Hydration time stamp context value must be a number."),
    );
  });

  it("Hydration time stamp context undefined, without initial cache values.", async () => {
    const cacheKeyA = "a";
    const cacheKeyB = "b";
    const cacheA = new Cache();
    const cacheB = new Cache();

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
          useHook: () => useLoadOnMount(cacheKeyA, loadA),
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with the a different cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyA, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[2].rerender();
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different cache key.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyB, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 5);
    ok("returned" in results[4]);
    strictEqual(results[4].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[4].rerender();
    });

    strictEqual(results.length, 6);
    ok("returned" in results[5]);
    strictEqual(results[5].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different loader.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyB, loadB),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 7);
    ok("returned" in results[6]);
    strictEqual(results[6].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[6].rerender();
    });

    strictEqual(results.length, 8);
    ok("returned" in results[7]);
    strictEqual(results[7].returned, undefined);
    deepStrictEqual(loadCalls, []);
  });

  it("Hydration time stamp context undefined, with initial cache values.", async () => {
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
          useHook: () => useLoadOnMount(cacheKeyA, loadA),
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with the a different cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyA, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[2].rerender();
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different cache key.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyB, loadA),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 5);
    ok("returned" in results[4]);
    strictEqual(results[4].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[4].rerender();
    });

    strictEqual(results.length, 6);
    ok("returned" in results[5]);
    strictEqual(results[5].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different loader.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyB, loadB),
            results,
          }),
        ),
      );
    });

    strictEqual(results.length, 7);
    ok("returned" in results[6]);
    strictEqual(results[6].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[6].rerender();
    });

    strictEqual(results.length, 8);
    ok("returned" in results[7]);
    strictEqual(results[7].returned, undefined);
    deepStrictEqual(loadCalls, []);
  });

  it("Hydration time stamp context defined, without initial cache values.", async () => {
    const cacheKeyA = "a";
    const cacheKeyB = "b";
    const cacheA = new Cache();
    const cacheB = new Cache();
    const hydrationTimeStamp = performance.now();

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
        React.createElement(
          HydrationTimeStampContext.Provider,
          { value: hydrationTimeStamp },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyA, loadA),
            results,
          }),
        ),
      ),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with the a different cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyA, loadA),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[2].rerender();
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different cache key.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyB, loadA),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 5);
    ok("returned" in results[4]);
    strictEqual(results[4].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[4].rerender();
    });

    strictEqual(results.length, 6);
    ok("returned" in results[5]);
    strictEqual(results[5].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different loader.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyB, loadB),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 7);
    ok("returned" in results[6]);
    strictEqual(results[6].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[6].rerender();
    });

    strictEqual(results.length, 8);
    ok("returned" in results[7]);
    strictEqual(results[7].returned, undefined);
    deepStrictEqual(loadCalls, []);
  });

  it("Hydration time stamp context defined, with initial cache values.", async () => {
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
        React.createElement(
          HydrationTimeStampContext.Provider,
          { value: hydrationTimeStamp },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadOnMount(cacheKeyA, loadA),
            results,
          }),
        ),
      ),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[0].rerender();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with the a different cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyA, loadA),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    strictEqual(results[2].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[2].rerender();
    });

    strictEqual(results.length, 4);
    ok("returned" in results[3]);
    strictEqual(results[3].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different cache key.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyB, loadA),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 5);
    ok("returned" in results[4]);
    strictEqual(results[4].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[4].rerender();
    });

    strictEqual(results.length, 6);
    ok("returned" in results[5]);
    strictEqual(results[5].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test re-rendering with a different loader.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheB },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyB, loadB),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 7);
    ok("returned" in results[6]);
    strictEqual(results[6].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Test that re-rendering doesn’t cause another load.
    ReactTestRenderer.act(() => {
      results[6].rerender();
    });

    strictEqual(results.length, 8);
    ok("returned" in results[7]);
    strictEqual(results[7].returned, undefined);
    deepStrictEqual(loadCalls, []);

    // Wait for the hydration time to expire.
    await new Promise((resolve) => setTimeout(resolve, HYDRATION_TIME_MS + 50));

    // Test re-rendering with the a different cache.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheA },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyB, loadB),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 9);
    ok("returned" in results[8]);
    strictEqual(results[8].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test re-rendering with the a different cache key.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheA },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyA, loadB),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 10);
    ok("returned" in results[9]);
    strictEqual(results[9].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadB,
        hadArgs: false,
      },
    ]);

    loadCalls = [];

    // Test re-rendering with the a different loader.
    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          CacheContext.Provider,
          { value: cacheA },
          React.createElement(
            HydrationTimeStampContext.Provider,
            { value: hydrationTimeStamp },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadOnMount(cacheKeyA, loadA),
              results,
            }),
          ),
        ),
      );
    });

    strictEqual(results.length, 11);
    ok("returned" in results[10]);
    strictEqual(results[10].returned, undefined);
    deepStrictEqual(loadCalls, [
      {
        loader: loadA,
        hadArgs: false,
      },
    ]);
  });
});
