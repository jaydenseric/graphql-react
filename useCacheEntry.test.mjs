// @ts-check
import { deepStrictEqual, ok, strictEqual, throws } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useCacheEntry from "./useCacheEntry.mjs";

/**
 * Adds `useCacheEntry` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useCacheEntry` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useCacheEntry.mjs", import.meta.url),
      550
    );
  });

  tests.add("`useCacheEntry` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useCacheEntry(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useCacheEntry` with cache context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: () => useCacheEntry("a"),
        results,
      })
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(results[0].threw, new TypeError("Cache context missing."));
  });

  tests.add(
    "`useCacheEntry` with cache context value not a `Cache` instance.",
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
            useHook: () => useCacheEntry("a"),
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

  tests.add(
    "`useCacheEntry` without initial cache values for each cache key used.",
    () => {
      const cache = new Cache();
      const cacheKeyA = "a";

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      const testRenderer = createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () => useCacheEntry(cacheKeyA),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, undefined);

      const cacheValueA2 = "a2";

      ReactTestRenderer.act(() => {
        cacheEntrySet(cache, cacheKeyA, cacheValueA2);
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      strictEqual(results[1].returned, cacheValueA2);

      ReactTestRenderer.act(() => {
        cacheEntryDelete(cache, cacheKeyA);
      });

      strictEqual(results.length, 3);
      ok("returned" in results[2]);
      strictEqual(results[2].returned, undefined);

      const cacheKeyB = "b";

      ReactTestRenderer.act(() => {
        testRenderer.update(
          React.createElement(
            CacheContext.Provider,
            { value: cache },
            React.createElement(ReactHookTest, {
              useHook: () => useCacheEntry(cacheKeyB),
              results,
            })
          )
        );
      });

      strictEqual(results.length, 4);
      ok("returned" in results[3]);
      strictEqual(results[3].returned, undefined);

      const cacheValueB2 = "b2";

      ReactTestRenderer.act(() => {
        cacheEntrySet(cache, cacheKeyB, cacheValueB2);
      });

      strictEqual(results.length, 5);
      ok("returned" in results[4]);
      strictEqual(results[4].returned, cacheValueB2);

      ReactTestRenderer.act(() => {
        cacheEntryDelete(cache, cacheKeyB);
      });

      strictEqual(results.length, 6);
      ok("returned" in results[5]);
      strictEqual(results[5].returned, undefined);
    }
  );

  tests.add(
    "`useCacheEntry` with initial cache values for each cache key used, replacing cache values.",
    () => {
      const cacheKeyA = "a";
      const cacheValueA1 = "a1";
      const cacheKeyB = "b";
      const cacheValueB1 = "b1";
      const cache = new Cache({
        [cacheKeyA]: cacheValueA1,
        [cacheKeyB]: cacheValueB1,
      });

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      const testRenderer = createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () => useCacheEntry(cacheKeyA),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, cacheValueA1);

      const cacheValueA2 = "a2";

      ReactTestRenderer.act(() => {
        cacheEntrySet(cache, cacheKeyA, cacheValueA2);
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      strictEqual(results[1].returned, cacheValueA2);

      ReactTestRenderer.act(() => {
        cacheEntryDelete(cache, cacheKeyA);
      });

      strictEqual(results.length, 3);
      ok("returned" in results[2]);
      strictEqual(results[2].returned, undefined);

      ReactTestRenderer.act(() => {
        testRenderer.update(
          React.createElement(
            CacheContext.Provider,
            { value: cache },
            React.createElement(ReactHookTest, {
              useHook: () => useCacheEntry(cacheKeyB),
              results,
            })
          )
        );
      });

      strictEqual(results.length, 4);
      ok("returned" in results[3]);
      strictEqual(results[3].returned, cacheValueB1);

      const cacheValueB2 = "b2";

      ReactTestRenderer.act(() => {
        cacheEntrySet(cache, cacheKeyB, cacheValueB2);
      });

      strictEqual(results.length, 5);
      ok("returned" in results[4]);
      strictEqual(results[4].returned, cacheValueB2);

      ReactTestRenderer.act(() => {
        cacheEntryDelete(cache, cacheKeyB);
      });

      strictEqual(results.length, 6);
      ok("returned" in results[5]);
      strictEqual(results[5].returned, undefined);
    }
  );

  tests.add(
    "`useCacheEntry` with initial cache value, mutating cache value.",
    () => {
      const cacheKey = "a";
      const cacheValue = { a: 1 };
      const cache = new Cache({
        [cacheKey]: cacheValue,
      });

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () => useCacheEntry(cacheKey),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, cacheValue);

      ReactTestRenderer.act(() => {
        cacheValue.a = 2;
        cache.dispatchEvent(
          new CustomEvent(`${cacheKey}/set`, {
            detail: {
              cacheValue,
            },
          })
        );
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      strictEqual(results[1].returned, cacheValue);

      ReactTestRenderer.act(() => {
        cacheEntryDelete(cache, cacheKey);
      });

      strictEqual(results.length, 3);
      ok("returned" in results[2]);
      strictEqual(results[2].returned, undefined);
    }
  );
};
