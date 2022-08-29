// @ts-check

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import Deferred from "./test/Deferred.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoadingEntry from "./useLoadingEntry.mjs";

/**
 * Adds `useLoadingEntry` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useLoadingEntry` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadingEntry.mjs", import.meta.url),
      500
    );
  });

  tests.add("`useLoadingEntry` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadingEntry(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useLoadingEntry` with loading context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: () => useLoadingEntry("a"),
        results,
      })
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Loading context missing.")
    );
  });

  tests.add(
    "`useLoadingEntry` with loading context value not a `Loading` instance.",
    () => {
      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          LoadingContext.Provider,
          {
            // @ts-expect-error Testing invalid.
            value: true,
          },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadingEntry("a"),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("threw" in results[0]);
      deepStrictEqual(
        results[0].threw,
        new TypeError("Loading context value must be a `Loading` instance.")
      );
    }
  );

  tests.add(
    "`useLoadingEntry` without initial loading for each cache key used.",
    async () => {
      const loading = new Loading();
      const cache = new Cache();
      const cacheKeyA = "a";

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      const testRenderer = createReactTestRenderer(
        React.createElement(
          LoadingContext.Provider,
          { value: loading },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadingEntry(cacheKeyA),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, undefined);

      const { promise: loadingA1Result, resolve: loadingA1ResultResolve } =
        /** @type {Deferred<Readonly<Record<string, unknown>>>} */
        (new Deferred());

      /** @type {LoadingCacheValue | undefined} */
      let loadingA1CacheValue;

      ReactTestRenderer.act(() => {
        loadingA1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyA,
          loadingA1Result,
          new AbortController()
        );
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      deepStrictEqual(results[1].returned, new Set([loadingA1CacheValue]));

      await ReactTestRenderer.act(async () => {
        loadingA1ResultResolve({});
        await /** @type {LoadingCacheValue} */ (loadingA1CacheValue).promise;
      });

      strictEqual(results.length, 3);
      ok("returned" in results[2]);
      strictEqual(results[2].returned, undefined);

      const cacheKeyB = "b";

      ReactTestRenderer.act(() => {
        testRenderer.update(
          React.createElement(
            LoadingContext.Provider,
            { value: loading },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadingEntry(cacheKeyB),
              results,
            })
          )
        );
      });

      strictEqual(results.length, 4);
      ok("returned" in results[3]);
      strictEqual(results[3].returned, undefined);

      const { promise: loadingB1Result, resolve: loadingB1ResultResolve } =
        /** @type {Deferred<Readonly<Record<string, unknown>>>} */
        (new Deferred());

      /** @type {LoadingCacheValue | undefined} */
      let loadingB1CacheValue;

      ReactTestRenderer.act(() => {
        loadingB1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyB,
          loadingB1Result,
          new AbortController()
        );
      });

      strictEqual(results.length, 5);
      ok("returned" in results[4]);
      deepStrictEqual(results[4].returned, new Set([loadingB1CacheValue]));

      await ReactTestRenderer.act(async () => {
        loadingB1ResultResolve({});
        await /** @type {LoadingCacheValue} */ (loadingB1CacheValue).promise;
      });

      strictEqual(results.length, 6);
      ok("returned" in results[5]);
      strictEqual(results[5].returned, undefined);
    }
  );

  tests.add(
    "`useLoadingEntry` with initial loading for each cache key used.",
    async () => {
      const loading = new Loading();
      const cache = new Cache();
      const cacheKeyA = "a";
      const { promise: loadingA1Result, resolve: loadingA1ResultResolve } =
        /** @type {Deferred<Readonly<Record<string, unknown>>>} */
        (new Deferred());
      const loadingA1CacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKeyA,
        loadingA1Result,
        new AbortController()
      );

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      const testRenderer = createReactTestRenderer(
        React.createElement(
          LoadingContext.Provider,
          { value: loading },
          React.createElement(ReactHookTest, {
            useHook: () => useLoadingEntry(cacheKeyA),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      deepStrictEqual(results[0].returned, new Set([loadingA1CacheValue]));

      const { promise: loadingA2Result, resolve: loadingA2ResultResolve } =
        /** @type {Deferred<Readonly<Record<string, unknown>>>} */
        (new Deferred());

      /** @type {LoadingCacheValue | undefined} */
      let loadingA2CacheValue;

      ReactTestRenderer.act(() => {
        loadingA2CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyA,
          loadingA2Result,
          new AbortController()
        );
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      deepStrictEqual(
        results[1].returned,
        new Set([loadingA1CacheValue, loadingA2CacheValue])
      );

      await ReactTestRenderer.act(async () => {
        loadingA1ResultResolve({});
        await loadingA1CacheValue.promise;
      });

      strictEqual(results.length, 3);
      ok("returned" in results[2]);
      deepStrictEqual(results[2].returned, new Set([loadingA2CacheValue]));

      await ReactTestRenderer.act(async () => {
        loadingA2ResultResolve({});
        await /** @type {LoadingCacheValue} */ (loadingA2CacheValue).promise;
      });

      strictEqual(results.length, 4);
      ok("returned" in results[3]);
      strictEqual(results[3].returned, undefined);

      const cacheKeyB = "b";
      const { promise: loadingB1Result, resolve: loadingB1ResultResolve } =
        /** @type {Deferred<Readonly<Record<string, unknown>>>} */
        (new Deferred());

      /** @type {LoadingCacheValue | undefined} */
      let loadingB1CacheValue;

      loadingB1CacheValue = new LoadingCacheValue(
        loading,
        cache,
        cacheKeyB,
        loadingB1Result,
        new AbortController()
      );

      ReactTestRenderer.act(() => {
        testRenderer.update(
          React.createElement(
            LoadingContext.Provider,
            { value: loading },
            React.createElement(ReactHookTest, {
              useHook: () => useLoadingEntry(cacheKeyB),
              results,
            })
          )
        );
      });

      strictEqual(results.length, 5);
      ok("returned" in results[4]);
      deepStrictEqual(results[4].returned, new Set([loadingB1CacheValue]));

      await ReactTestRenderer.act(async () => {
        loadingB1ResultResolve({});
        await /** @type {LoadingCacheValue} */ (loadingB1CacheValue).promise;
      });

      strictEqual(results.length, 6);
      ok("returned" in results[5]);
      strictEqual(results[5].returned, undefined);
    }
  );
};
